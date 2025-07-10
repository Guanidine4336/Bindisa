import User from "../models/User.js";
import Farm from "../models/Farm.js";
import SoilAnalysis from "../models/SoilAnalysis.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
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

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    // This would typically handle file upload using multer
    // For now, just accepting avatar URL
    const { avatarUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "profile.avatar": avatarUrl },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [farmCount, soilAnalysisCount] = await Promise.all([
      Farm.countDocuments({ owner: userId }),
      SoilAnalysis.countDocuments({ user: userId }),
    ]);

    const stats = {
      totalFarms: farmCount,
      totalSoilAnalyses: soilAnalysisCount,
      memberSince: req.user.createdAt,
      lastLogin: req.user.lastLogin,
    };

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin/Expert
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: { message: "User deactivated successfully" },
    });
  } catch (error) {
    next(error);
  }
};
