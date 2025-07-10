// Mock crop database - in real implementation, you'd have a Crop model

const mockCrops = [
  {
    id: "1",
    name: "Rice",
    scientificName: "Oryza sativa",
    category: "cereal",
    varieties: ["Basmati", "Jasmine", "Ponni"],
    soilRequirements: {
      ph: { min: 5.5, max: 7.0 },
      type: ["clay", "loamy"],
      drainage: "poor_to_moderate",
    },
    climate: {
      temperature: { min: 20, max: 35 },
      rainfall: { min: 1000, max: 2500 },
      humidity: { min: 60, max: 85 },
    },
    season: "kharif",
    growthPeriod: 120, // days
    yield: { min: 3000, max: 6000 }, // kg/hectare
    marketPrice: { min: 20, max: 30 }, // per kg
    nutrients: {
      nitrogen: "high",
      phosphorus: "medium",
      potassium: "medium",
    },
  },
  {
    id: "2",
    name: "Wheat",
    scientificName: "Triticum aestivum",
    category: "cereal",
    varieties: ["Durum", "Hard Red", "Soft White"],
    soilRequirements: {
      ph: { min: 6.0, max: 7.5 },
      type: ["loamy", "clay"],
      drainage: "well_drained",
    },
    climate: {
      temperature: { min: 15, max: 25 },
      rainfall: { min: 300, max: 750 },
      humidity: { min: 40, max: 70 },
    },
    season: "rabi",
    growthPeriod: 110,
    yield: { min: 2500, max: 5000 },
    marketPrice: { min: 18, max: 25 },
    nutrients: {
      nitrogen: "high",
      phosphorus: "high",
      potassium: "medium",
    },
  },
];

// @desc    Get all crops
// @route   GET /api/crops
// @access  Public
export const getCrops = async (req, res, next) => {
  try {
    const {
      category,
      season,
      soilType,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    let filteredCrops = [...mockCrops];

    // Apply filters
    if (category) {
      filteredCrops = filteredCrops.filter(
        (crop) => crop.category === category,
      );
    }

    if (season) {
      filteredCrops = filteredCrops.filter((crop) => crop.season === season);
    }

    if (soilType) {
      filteredCrops = filteredCrops.filter((crop) =>
        crop.soilRequirements.type.includes(soilType),
      );
    }

    if (search) {
      filteredCrops = filteredCrops.filter((crop) =>
        crop.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCrops = filteredCrops.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        crops: paginatedCrops,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredCrops.length,
          pages: Math.ceil(filteredCrops.length / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Public
export const getCrop = async (req, res, next) => {
  try {
    const crop = mockCrops.find((c) => c.id === req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: { message: "Crop not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: { crop },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new crop
// @route   POST /api/crops
// @access  Private (Admin/Expert)
export const createCrop = async (req, res, next) => {
  try {
    // In real implementation, save to database
    const newCrop = {
      id: (mockCrops.length + 1).toString(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date(),
    };

    mockCrops.push(newCrop);

    res.status(201).json({
      success: true,
      data: { crop: newCrop },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private (Admin/Expert)
export const updateCrop = async (req, res, next) => {
  try {
    const cropIndex = mockCrops.findIndex((c) => c.id === req.params.id);

    if (cropIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: "Crop not found" },
      });
    }

    mockCrops[cropIndex] = {
      ...mockCrops[cropIndex],
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id,
    };

    res.status(200).json({
      success: true,
      data: { crop: mockCrops[cropIndex] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private (Admin)
export const deleteCrop = async (req, res, next) => {
  try {
    const cropIndex = mockCrops.findIndex((c) => c.id === req.params.id);

    if (cropIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: "Crop not found" },
      });
    }

    mockCrops.splice(cropIndex, 1);

    res.status(200).json({
      success: true,
      data: { message: "Crop deleted successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop recommendations
// @route   GET /api/crops/recommendations/:soilType/:climate
// @access  Public
export const getCropRecommendations = async (req, res, next) => {
  try {
    const { soilType, climate } = req.params;

    const recommendations = mockCrops.filter((crop) => {
      return crop.soilRequirements.type.includes(soilType);
    });

    res.status(200).json({
      success: true,
      data: { recommendations },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop calendar
// @route   GET /api/crops/calendar/:cropName/:location
// @access  Public
export const getCropCalendar = async (req, res, next) => {
  try {
    const { cropName, location } = req.params;

    // Mock crop calendar
    const calendar = {
      crop: cropName,
      location,
      activities: [
        {
          activity: "Land Preparation",
          startDate: "2024-03-01",
          endDate: "2024-03-15",
          description: "Plough and prepare the field",
        },
        {
          activity: "Sowing",
          startDate: "2024-03-15",
          endDate: "2024-03-30",
          description: "Sow seeds with proper spacing",
        },
        {
          activity: "Germination",
          startDate: "2024-03-30",
          endDate: "2024-04-15",
          description: "Monitor germination and water regularly",
        },
        {
          activity: "Fertilizer Application",
          startDate: "2024-04-20",
          endDate: "2024-04-25",
          description: "Apply first dose of fertilizer",
        },
        {
          activity: "Harvesting",
          startDate: "2024-07-01",
          endDate: "2024-07-15",
          description: "Harvest when crop is mature",
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: { calendar },
    });
  } catch (error) {
    next(error);
  }
};
