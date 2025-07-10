import mongoose from "mongoose";

const soilAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
    },
    location: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
      plotNumber: String,
    },
    soilParameters: {
      ph: {
        value: { type: Number, required: true, min: 0, max: 14 },
        status: {
          type: String,
          enum: ["low", "optimal", "high"],
          required: true,
        },
      },
      moisture: {
        value: { type: Number, required: true, min: 0, max: 100 },
        status: {
          type: String,
          enum: ["low", "optimal", "high"],
          required: true,
        },
      },
      nitrogen: {
        value: { type: Number, required: true, min: 0, max: 100 },
        status: {
          type: String,
          enum: ["low", "optimal", "high"],
          required: true,
        },
      },
      phosphorus: {
        value: { type: Number, required: true, min: 0, max: 100 },
        status: {
          type: String,
          enum: ["low", "optimal", "high"],
          required: true,
        },
      },
      potassium: {
        value: { type: Number, required: true, min: 0, max: 100 },
        status: {
          type: String,
          enum: ["low", "optimal", "high"],
          required: true,
        },
      },
      temperature: {
        value: { type: Number, required: true },
        unit: { type: String, default: "celsius" },
      },
      organicMatter: {
        value: Number,
        status: {
          type: String,
          enum: ["low", "optimal", "high"],
        },
      },
      electricalConductivity: {
        value: Number,
        unit: { type: String, default: "dS/m" },
      },
    },
    analysis: {
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      soilHealth: {
        type: String,
        enum: ["poor", "fair", "good", "excellent"],
        required: true,
      },
      recommendations: [
        {
          type: {
            type: String,
            enum: ["fertilizer", "amendment", "irrigation", "practice"],
            required: true,
          },
          priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            required: true,
          },
          title: { type: String, required: true },
          description: { type: String, required: true },
          quantity: String,
          timing: String,
          cost: {
            value: Number,
            currency: { type: String, default: "INR" },
          },
        },
      ],
      suitableCrops: [
        {
          name: { type: String, required: true },
          suitabilityScore: { type: Number, min: 0, max: 100 },
          season: String,
          expectedYield: String,
          marketPrice: Number,
        },
      ],
    },
    testMethod: {
      type: String,
      enum: ["manual", "sensor", "laboratory", "ai_estimation"],
      default: "manual",
    },
    sensorData: {
      sensorId: String,
      deviceModel: String,
      calibrationDate: Date,
      accuracy: Number,
    },
    images: [
      {
        url: String,
        caption: String,
        type: {
          type: String,
          enum: ["soil_sample", "field_photo", "test_result"],
        },
      },
    ],
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["view", "edit"] },
        sharedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "requires_review"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  },
);

// Create index for geospatial queries
soilAnalysisSchema.index({ "location.coordinates": "2dsphere" });

// Create index for user and date queries
soilAnalysisSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("SoilAnalysis", soilAnalysisSchema);
