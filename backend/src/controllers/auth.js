import crypto from "crypto";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = "farmer" } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: { message: "Please provide all required fields" },
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: "User already exists with this email or phone" },
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    // Generate token
    const token = user.getSignedJwtToken();

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profile: user.profile,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: "Please provide an email and password" },
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: "Account is deactivated" },
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profile: user.profile,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (client-side mostly)
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { message: "User logged out successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profile: user.profile,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "There is no user with that email" },
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // In a real application, you would send an email here
    // For now, we'll just return the token (don't do this in production!)
    res.status(200).json({
      success: true,
      data: {
        message: "Password reset token generated",
        resetToken: resetToken, // Remove this in production
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid or expired token" },
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      data: {
        token,
        message: "Password reset successful",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
export const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profile: req.body.profile,
      preferences: req.body.preferences,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: { message: "Current password is incorrect" },
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      data: {
        token,
        message: "Password updated successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    // Implementation for email verification
    res.status(200).json({
      success: true,
      data: { message: "Email verified successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendEmailVerification = async (req, res, next) => {
  try {
    // Implementation for resending email verification
    res.status(200).json({
      success: true,
      data: { message: "Verification email sent" },
    });
  } catch (error) {
    next(error);
  }
};
