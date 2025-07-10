import User from "../models/User.js";
import Farm from "../models/Farm.js";
import SoilAnalysis from "../models/SoilAnalysis.js";
import ChatbotConversation from "../models/ChatbotConversation.js";

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [farmCount, soilAnalysisCount, chatbotConversations] =
      await Promise.all([
        Farm.countDocuments({ owner: userId, isActive: true }),
        SoilAnalysis.countDocuments({ user: userId }),
        ChatbotConversation.countDocuments({ user: userId }),
      ]);

    // Mock additional stats
    const stats = {
      totalFarms: farmCount,
      totalSoilAnalyses: soilAnalysisCount,
      totalConversations: chatbotConversations,
      totalYield: 0, // Would be calculated from actual farm data
      totalIncome: 0, // Would be calculated from actual farm data
      weeklyGrowth: {
        farms: 12.5,
        analyses: 8.3,
        yield: 15.2,
      },
      recentAlerts: 2,
      upcomingTasks: 5,
    };

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
export const getRecentActivity = async (req, res, next) => {
  try {
    // Mock recent activities
    const activities = [
      {
        id: "1",
        type: "soil_analysis",
        title: "Soil Analysis Completed",
        description: "Farm 1 - North Field analysis results available",
        timestamp: new Date(),
        icon: "beaker",
      },
      {
        id: "2",
        type: "weather_alert",
        title: "Weather Alert",
        description: "Heavy rain expected tomorrow",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: "cloud-rain",
      },
      {
        id: "3",
        type: "crop_update",
        title: "Crop Growth Update",
        description: "Wheat crop entered flowering stage",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: "sprout",
      },
    ];

    res.status(200).json({
      success: true,
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weather summary
// @route   GET /api/dashboard/weather
// @access  Private
export const getWeatherSummary = async (req, res, next) => {
  try {
    // Mock weather summary
    const weather = {
      current: {
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        condition: "partly_cloudy",
        description: "Partly cloudy",
      },
      forecast: [
        {
          date: new Date(),
          temperature: { min: 22, max: 30 },
          condition: "partly_cloudy",
          precipitation: 10,
        },
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          temperature: { min: 20, max: 28 },
          condition: "rainy",
          precipitation: 80,
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          temperature: { min: 24, max: 32 },
          condition: "sunny",
          precipitation: 0,
        },
      ],
      alerts: [
        {
          type: "heavy_rain",
          severity: "moderate",
          message: "Heavy rain expected tomorrow",
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: { weather },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop status
// @route   GET /api/dashboard/crops
// @access  Private
export const getCropStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get farms for the user
    const farms = await Farm.find({
      owner: userId,
      isActive: true,
    }).select("crops");

    // Process crop data
    const allCrops = farms.flatMap((farm) => farm.crops);
    const cropSummary = {
      total: allCrops.length,
      byStatus: {
        planned: allCrops.filter((c) => c.status === "planned").length,
        planted: allCrops.filter((c) => c.status === "planted").length,
        growing: allCrops.filter((c) => c.status === "growing").length,
        harvested: allCrops.filter((c) => c.status === "harvested").length,
      },
      byType: {},
      upcomingHarvests: allCrops
        .filter((c) => c.harvestDate && c.harvestDate > new Date())
        .sort((a, b) => a.harvestDate - b.harvestDate)
        .slice(0, 5),
    };

    // Count by crop type
    allCrops.forEach((crop) => {
      cropSummary.byType[crop.name] = (cropSummary.byType[crop.name] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: { cropSummary },
    });
  } catch (error) {
    next(error);
  }
};
