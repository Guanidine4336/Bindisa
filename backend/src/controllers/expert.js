import User from "../models/User.js";

// @desc    Get all experts
// @route   GET /api/experts
// @access  Public
export const getExperts = async (req, res, next) => {
  try {
    const { specialization, location, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: "expert", isActive: true };

    if (specialization) {
      query["profile.expertise.specializations"] = {
        $in: [specialization],
      };
    }

    if (location) {
      query["profile.location.city"] = new RegExp(location, "i");
    }

    const experts = await User.find(query)
      .select(
        "name email profile.avatar profile.bio profile.location profile.expertise",
      )
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ "profile.expertise.experience": -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        experts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expert
// @route   GET /api/experts/:id
// @access  Public
export const getExpert = async (req, res, next) => {
  try {
    const expert = await User.findOne({
      _id: req.params.id,
      role: "expert",
      isActive: true,
    }).select(
      "name email profile.avatar profile.bio profile.location profile.expertise createdAt",
    );

    if (!expert) {
      return res.status(404).json({
        success: false,
        error: { message: "Expert not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: { expert },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book consultation
// @route   POST /api/experts/consultation
// @access  Private
export const bookConsultation = async (req, res, next) => {
  try {
    const { expertId, topic, description, preferredDate, duration } = req.body;

    // In a real implementation, you'd create a Consultation model
    const consultation = {
      id: Date.now().toString(),
      farmer: req.user.id,
      expert: expertId,
      topic,
      description,
      preferredDate,
      duration: duration || 30,
      status: "pending",
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: { consultation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get consultations
// @route   GET /api/experts/consultations
// @access  Private
export const getConsultations = async (req, res, next) => {
  try {
    // Mock consultations - in real implementation, query from database
    const consultations = [
      {
        id: "1",
        farmer: req.user.id,
        expert: "expert_1",
        topic: "Soil Health",
        description: "Need advice on improving soil quality",
        status: "scheduled",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 30,
        createdAt: new Date(),
      },
    ];

    res.status(200).json({
      success: true,
      data: { consultations },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consultation
// @route   PUT /api/experts/consultation/:id
// @access  Private (Expert)
export const updateConsultation = async (req, res, next) => {
  try {
    const { status, scheduledDate, notes } = req.body;

    // In real implementation, update consultation in database
    const consultation = {
      id: req.params.id,
      status,
      scheduledDate,
      notes,
      updatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      data: { consultation },
    });
  } catch (error) {
    next(error);
  }
};
