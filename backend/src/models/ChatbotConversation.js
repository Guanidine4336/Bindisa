import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ["en", "hi", "mr"],
    default: "en",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    intent: String, // detected intent
    confidence: Number, // confidence score
    entities: [
      {
        entity: String,
        value: String,
        confidence: Number,
      },
    ],
    responseTime: Number, // in milliseconds
    source: {
      type: String,
      enum: ["rule_based", "ml_model", "expert_system", "fallback"],
      default: "rule_based",
    },
  },
});

const chatbotConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [messageSchema],
    context: {
      currentTopic: String,
      farmInfo: {
        farmId: { type: mongoose.Schema.Types.ObjectId, ref: "Farm" },
        cropType: String,
        season: String,
        area: Number,
      },
      weather: {
        location: String,
        currentConditions: Object,
        forecast: Object,
      },
      soilData: {
        ph: Number,
        moisture: Number,
        nutrients: Object,
      },
      userPreferences: {
        language: String,
        units: String,
        expertise_level: String,
      },
    },
    status: {
      type: String,
      enum: ["active", "resolved", "escalated", "abandoned"],
      default: "active",
    },
    satisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      ratedAt: Date,
    },
    escalation: {
      isEscalated: { type: Boolean, default: false },
      reason: String,
      escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      escalatedAt: Date,
      resolvedAt: Date,
    },
    analytics: {
      totalMessages: { type: Number, default: 0 },
      duration: Number, // in seconds
      startedAt: { type: Date, default: Date.now },
      endedAt: Date,
      deviceInfo: {
        userAgent: String,
        platform: String,
        language: String,
      },
    },
    tags: [String], // for categorization
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
chatbotConversationSchema.index({ user: 1, createdAt: -1 });
chatbotConversationSchema.index({ sessionId: 1 });
chatbotConversationSchema.index({ status: 1 });

// Update message count when messages are added
chatbotConversationSchema.pre("save", function (next) {
  this.analytics.totalMessages = this.messages.length;
  next();
});

export default mongoose.model("ChatbotConversation", chatbotConversationSchema);
