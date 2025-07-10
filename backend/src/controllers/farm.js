import Farm from "../models/Farm.js";

// @desc    Create farm
// @route   POST /api/farms
// @access  Private
export const createFarm = async (req, res, next) => {
  try {
    const farmData = {
      ...req.body,
      owner: req.user.id,
    };

    const farm = await Farm.create(farmData);

    res.status(201).json({
      success: true,
      data: { farm },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all farms for user
// @route   GET /api/farms
// @access  Private
export const getFarms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const farms = await Farm.find({
      $or: [{ owner: req.user.id }, { "sharedWith.user": req.user.id }],
      isActive: true,
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Farm.countDocuments({
      $or: [{ owner: req.user.id }, { "sharedWith.user": req.user.id }],
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        farms,
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

// @desc    Get single farm
// @route   GET /api/farms/:id
// @access  Private
export const getFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { "sharedWith.user": req.user.id },
        { visibility: "public" },
      ],
    }).populate("owner", "name email");

    if (!farm) {
      return res.status(404).json({
        success: false,
        error: { message: "Farm not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: { farm },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update farm
// @route   PUT /api/farms/:id
// @access  Private
export const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        error: { message: "Farm not found" },
      });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: { farm },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete farm
// @route   DELETE /api/farms/:id
// @access  Private
export const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        error: { message: "Farm not found" },
      });
    }

    farm.isActive = false;
    await farm.save();

    res.status(200).json({
      success: true,
      data: { message: "Farm deleted successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share farm
// @route   POST /api/farms/:id/share
// @access  Private
export const shareFarm = async (req, res, next) => {
  try {
    const { userId, role = "view" } = req.body;

    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        error: { message: "Farm not found" },
      });
    }

    const existingShare = farm.sharedWith.find(
      (share) => share.user.toString() === userId,
    );

    if (existingShare) {
      existingShare.role = role;
    } else {
      farm.sharedWith.push({ user: userId, role });
    }

    await farm.save();

    res.status(200).json({
      success: true,
      data: { message: "Farm shared successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farm analytics
// @route   GET /api/farms/:id/analytics
// @access  Private
export const getFarmAnalytics = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user.id }, { "sharedWith.user": req.user.id }],
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        error: { message: "Farm not found" },
      });
    }

    // Calculate analytics
    const totalExpenses = farm.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const totalIncome = farm.income.reduce(
      (sum, income) => sum + income.amount,
      0,
    );
    const netProfit = totalIncome - totalExpenses;

    const analytics = {
      financial: {
        totalExpenses,
        totalIncome,
        netProfit,
        profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
      },
      crops: {
        totalCrops: farm.crops.length,
        activeCrops: farm.crops.filter((crop) => crop.status === "growing")
          .length,
        harvestedCrops: farm.crops.filter((crop) => crop.status === "harvested")
          .length,
      },
      productivity: {
        averageYield:
          farm.crops.reduce((sum, crop) => sum + (crop.actualYield || 0), 0) /
          farm.crops.length,
        totalArea: farm.area.total,
        utilizationRate: farm.area.cultivable
          ? (farm.area.cultivable / farm.area.total) * 100
          : 0,
      },
    };

    res.status(200).json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    next(error);
  }
};
