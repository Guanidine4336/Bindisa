import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Farm name is required"],
      maxlength: [100, "Farm name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    location: {
      address: { type: String, required: true },
      city: String,
      state: String,
      country: { type: String, default: "India" },
      pincode: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: "2dsphere",
      },
    },
    area: {
      total: { type: Number, required: true }, // in acres
      cultivable: Number,
      unit: { type: String, enum: ["acres", "hectares"], default: "acres" },
    },
    soilType: {
      type: String,
      enum: [
        "alluvial",
        "black",
        "red",
        "laterite",
        "desert",
        "mountain",
        "clay",
        "loamy",
        "sandy",
        "mixed",
      ],
    },
    irrigationType: {
      type: String,
      enum: ["rainfed", "drip", "sprinkler", "flood", "mixed"],
      default: "rainfed",
    },
    waterSources: [
      {
        type: {
          type: String,
          enum: ["borewell", "well", "canal", "river", "pond", "rainwater"],
        },
        capacity: Number, // in liters
        quality: { type: String, enum: ["good", "moderate", "poor"] },
        seasonal: Boolean,
      },
    ],
    crops: [
      {
        name: { type: String, required: true },
        variety: String,
        area: Number, // in acres
        plantingDate: Date,
        harvestDate: Date,
        season: {
          type: String,
          enum: ["kharif", "rabi", "zaid", "perennial"],
        },
        status: {
          type: String,
          enum: ["planned", "planted", "growing", "harvested"],
          default: "planned",
        },
        expectedYield: Number,
        actualYield: Number,
        marketPrice: Number,
      },
    ],
    equipment: [
      {
        name: String,
        type: {
          type: String,
          enum: ["tractor", "harvester", "plow", "sprayer", "pump", "other"],
        },
        condition: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
        },
        purchaseDate: Date,
        maintenanceSchedule: String,
      },
    ],
    certifications: [
      {
        type: { type: String, enum: ["organic", "gmp", "iso", "other"] },
        issuedBy: String,
        issuedDate: Date,
        validUntil: Date,
        certificateNumber: String,
      },
    ],
    expenses: [
      {
        category: {
          type: String,
          enum: [
            "seeds",
            "fertilizer",
            "pesticide",
            "labor",
            "equipment",
            "other",
          ],
        },
        amount: Number,
        currency: { type: String, default: "INR" },
        date: Date,
        description: String,
        receipt: String, // file path
      },
    ],
    income: [
      {
        source: {
          type: String,
          enum: ["crop_sale", "livestock", "equipment_rent", "other"],
        },
        amount: Number,
        currency: { type: String, default: "INR" },
        date: Date,
        description: String,
        buyer: String,
      },
    ],
    weatherData: {
      lastUpdated: Date,
      averageRainfall: Number, // mm per year
      averageTemperature: {
        min: Number,
        max: Number,
      },
      humidity: Number,
      windSpeed: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    visibility: {
      type: String,
      enum: ["private", "public", "shared"],
      default: "private",
    },
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["view", "manage"] },
        sharedAt: { type: Date, default: Date.now },
      },
    ],
    images: [
      {
        url: String,
        caption: String,
        type: {
          type: String,
          enum: ["overview", "crop", "equipment", "other"],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
farmSchema.index({ owner: 1 });
farmSchema.index({ "location.coordinates": "2dsphere" });
farmSchema.index({ isActive: 1 });

export default mongoose.model("Farm", farmSchema);
