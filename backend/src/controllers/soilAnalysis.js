import SoilAnalysis from "../models/SoilAnalysis.js";

// Soil analysis logic
const analyzeSoilParameters = (parameters) => {
  const { ph, moisture, nitrogen, phosphorus, potassium, temperature } =
    parameters;

  const analysis = {
    overallScore: 0,
    soilHealth: "poor",
    recommendations: [],
    suitableCrops: [],
  };

  let score = 0;
  let parameterCount = 0;

  // pH Analysis
  if (ph !== undefined) {
    parameterCount++;
    if (ph >= 6.0 && ph <= 7.5) {
      score += 20;
      analysis.recommendations.push({
        type: "practice",
        priority: "low",
        title: "pH Level Optimal",
        description: "Your soil pH is in the optimal range for most crops.",
      });
    } else if (ph < 6.0) {
      score += 10;
      analysis.recommendations.push({
        type: "amendment",
        priority: "high",
        title: "Soil is Acidic",
        description:
          "Add lime to increase pH. Apply 200-500 kg/hectare of agricultural lime.",
        quantity: "200-500 kg/hectare",
        timing: "Before planting season",
      });
    } else {
      score += 10;
      analysis.recommendations.push({
        type: "amendment",
        priority: "medium",
        title: "Soil is Alkaline",
        description: "Add organic matter or sulfur to reduce pH.",
        quantity: "100-200 kg/hectare sulfur",
        timing: "2-3 months before planting",
      });
    }
  }

  // Nitrogen Analysis
  if (nitrogen !== undefined) {
    parameterCount++;
    if (nitrogen >= 40 && nitrogen <= 80) {
      score += 20;
    } else if (nitrogen < 40) {
      score += 8;
      analysis.recommendations.push({
        type: "fertilizer",
        priority: "high",
        title: "Nitrogen Deficiency",
        description: "Apply nitrogen-rich fertilizer like Urea.",
        quantity: "120-150 kg/hectare",
        timing: "Split application during crop growth",
      });
    } else {
      score += 12;
      analysis.recommendations.push({
        type: "practice",
        priority: "medium",
        title: "Excess Nitrogen",
        description:
          "Reduce nitrogen fertilizer application to prevent crop lodging.",
      });
    }
  }

  // Phosphorus Analysis
  if (phosphorus !== undefined) {
    parameterCount++;
    if (phosphorus >= 25 && phosphorus <= 70) {
      score += 20;
    } else if (phosphorus < 25) {
      score += 8;
      analysis.recommendations.push({
        type: "fertilizer",
        priority: "high",
        title: "Phosphorus Deficiency",
        description: "Apply DAP (Diammonium Phosphate) fertilizer.",
        quantity: "100-125 kg/hectare",
        timing: "At the time of planting",
      });
    }
  }

  // Potassium Analysis
  if (potassium !== undefined) {
    parameterCount++;
    if (potassium >= 30 && potassium <= 75) {
      score += 20;
    } else if (potassium < 30) {
      score += 8;
      analysis.recommendations.push({
        type: "fertilizer",
        priority: "high",
        title: "Potassium Deficiency",
        description: "Apply MOP (Muriate of Potash) fertilizer.",
        quantity: "50-75 kg/hectare",
        timing: "During flowering stage",
      });
    }
  }

  // Moisture Analysis
  if (moisture !== undefined) {
    parameterCount++;
    if (moisture >= 40 && moisture <= 70) {
      score += 20;
    } else if (moisture < 40) {
      score += 10;
      analysis.recommendations.push({
        type: "irrigation",
        priority: "high",
        title: "Low Soil Moisture",
        description:
          "Increase irrigation frequency. Consider drip irrigation for water efficiency.",
      });
    } else {
      score += 12;
      analysis.recommendations.push({
        type: "irrigation",
        priority: "medium",
        title: "Excess Moisture",
        description:
          "Improve drainage. Create furrows or install drainage tiles.",
      });
    }
  }

  // Calculate overall score
  analysis.overallScore =
    parameterCount > 0 ? Math.round(score / parameterCount) : 0;

  // Determine soil health
  if (analysis.overallScore >= 80) {
    analysis.soilHealth = "excellent";
  } else if (analysis.overallScore >= 60) {
    analysis.soilHealth = "good";
  } else if (analysis.overallScore >= 40) {
    analysis.soilHealth = "fair";
  } else {
    analysis.soilHealth = "poor";
  }

  // Suitable crops based on parameters
  if (ph >= 6.0 && ph <= 7.5 && nitrogen >= 40 && moisture >= 40) {
    analysis.suitableCrops = [
      { name: "Rice", suitabilityScore: 85, season: "Kharif" },
      { name: "Wheat", suitabilityScore: 80, season: "Rabi" },
      { name: "Maize", suitabilityScore: 75, season: "Kharif/Rabi" },
    ];
  } else if (ph >= 6.5 && ph <= 8.0) {
    analysis.suitableCrops = [
      { name: "Legumes", suitabilityScore: 70, season: "Rabi" },
      { name: "Oilseeds", suitabilityScore: 65, season: "Rabi" },
      { name: "Vegetables", suitabilityScore: 75, season: "All seasons" },
    ];
  } else {
    analysis.suitableCrops = [
      {
        name: "Mixed crops",
        suitabilityScore: 50,
        season: "Based on local conditions",
      },
      { name: "Fodder crops", suitabilityScore: 60, season: "All seasons" },
    ];
  }

  return analysis;
};

// @desc    Analyze soil parameters (public endpoint)
// @route   POST /api/soil-analysis/analyze
// @access  Public
export const analyzeParameters = async (req, res, next) => {
  try {
    const { ph, moisture, nitrogen, phosphorus, potassium, temperature } =
      req.body;

    // Validate required parameters
    if (ph === undefined || moisture === undefined || nitrogen === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message: "pH, moisture, and nitrogen are required parameters",
        },
      });
    }

    const analysis = analyzeSoilParameters(req.body);

    res.status(200).json({
      success: true,
      data: {
        parameters: req.body,
        analysis,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create soil analysis record
// @route   POST /api/soil-analysis
// @access  Private
export const createAnalysis = async (req, res, next) => {
  try {
    const analysisData = {
      ...req.body,
      user: req.user.id,
    };

    // Generate analysis if not provided
    if (!analysisData.analysis) {
      analysisData.analysis = analyzeSoilParameters(
        analysisData.soilParameters,
      );
    }

    const analysis = await SoilAnalysis.create(analysisData);

    res.status(201).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all soil analyses for user
// @route   GET /api/soil-analysis
// @access  Private
export const getAnalyses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await SoilAnalysis.find({ user: req.user.id })
      .populate("farm", "name location")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await SoilAnalysis.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        analyses,
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

// @desc    Get single soil analysis
// @route   GET /api/soil-analysis/:id
// @access  Private
export const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await SoilAnalysis.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { "sharedWith.user": req.user.id },
        { isShared: true },
      ],
    }).populate("farm", "name location");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: "Soil analysis not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update soil analysis
// @route   PUT /api/soil-analysis/:id
// @access  Private
export const updateAnalysis = async (req, res, next) => {
  try {
    let analysis = await SoilAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: "Soil analysis not found" },
      });
    }

    analysis = await SoilAnalysis.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete soil analysis
// @route   DELETE /api/soil-analysis/:id
// @access  Private
export const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await SoilAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: "Soil analysis not found" },
      });
    }

    await analysis.deleteOne();

    res.status(200).json({
      success: true,
      data: { message: "Soil analysis deleted successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendations for soil analysis
// @route   GET /api/soil-analysis/:id/recommendations
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const analysis = await SoilAnalysis.findOne({
      _id: req.params.id,
      $or: [{ user: req.user.id }, { isShared: true }],
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: "Soil analysis not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations: analysis.analysis.recommendations,
        suitableCrops: analysis.analysis.suitableCrops,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share soil analysis
// @route   POST /api/soil-analysis/:id/share
// @access  Private
export const shareAnalysis = async (req, res, next) => {
  try {
    const { userId, role = "view" } = req.body;

    const analysis = await SoilAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: "Soil analysis not found" },
      });
    }

    // Check if already shared with this user
    const existingShare = analysis.sharedWith.find(
      (share) => share.user.toString() === userId,
    );

    if (existingShare) {
      existingShare.role = role;
    } else {
      analysis.sharedWith.push({ user: userId, role });
    }

    await analysis.save();

    res.status(200).json({
      success: true,
      data: { message: "Analysis shared successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suitable crops based on parameters
// @route   GET /api/soil-analysis/crops/:ph/:nitrogen/:phosphorus/:potassium
// @access  Public
export const getSuitableCrops = async (req, res, next) => {
  try {
    const { ph, nitrogen, phosphorus, potassium } = req.params;

    const parameters = {
      ph: parseFloat(ph),
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
    };

    const analysis = analyzeSoilParameters(parameters);

    res.status(200).json({
      success: true,
      data: {
        suitableCrops: analysis.suitableCrops,
        soilHealth: analysis.soilHealth,
        overallScore: analysis.overallScore,
      },
    });
  } catch (error) {
    next(error);
  }
};
