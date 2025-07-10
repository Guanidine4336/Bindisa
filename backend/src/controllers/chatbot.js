import ChatbotConversation from "../models/ChatbotConversation.js";
import { v4 as uuidv4 } from "uuid";

// Chatbot response logic
const generateResponse = (message, language = "en", context = {}) => {
  const lowerMessage = message.toLowerCase();

  // Language-specific responses
  const responses = {
    hi: {
      greeting:
        "नमस्ते! मैं बिंदिसा एग्रीटेक का कृषि सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?",
      pest: "कीट प्रबंधन के लिए: 1) नीम का तेल स्प्रे करें 2) जैविक कीटनाशक का उपयोग करें 3) फसल चक्र अपनाएं 4) साफ-सफाई रखें।",
      soil: "मिट्टी की जां�� के लिए: 1) pH मीटर से pH चेक करें 2) नमी का स्तर देखें 3) NPK टेस्ट कराएं 4) हमारा सॉयल एनालिसिस टूल इस्तेमाल करें।",
      fertilizer:
        "उर्वरक की मात्रा फसल के अनुसार तय करें: 1) धान - 120:60:40 NPK प्रति हेक्टेयर 2) गेहूं - 150:75:50 NPK प्रति हेक्टेयर।",
      default:
        "आपका प्रश्न दिलचस्प है। कृपया अधिक विस्तार से बताएं या हमारे विशेषज्ञों से संपर्क करें।",
    },
    mr: {
      greeting:
        "नमस्कार! मी बिंदिसा एग्रीटेकचा कृषी सहाय्यक आहे। मी तुमची कशी मदत करू शकतो?",
      pest: "कीड व्यवस्थापनासाठी: 1) नीम तेल फवारा करा 2) जैविक कीटकनाशकाचा वापर करा 3) पीक चक्र अवलंबा 4) स्वच्छता ठेवा।",
      soil: "मातीची तपासणी करण्यासाठी: 1) pH मीटरने pH तपासा 2) ओलावा पातळी पहा 3) NPK चाचणी करा।",
      default:
        "तुमचा प्रश्न मनोरंजक आहे. कृपया अधिक तपशीलाने सांगा किंवा आमच्या तज्ञांशी संपर्क साधा.",
    },
    en: {
      greeting:
        "Hello! I'm Bindisa Agritech's agricultural assistant. How can I help you today?",
      pest: "For pest management: 1) Apply neem oil spray 2) Use biological pesticides 3) Practice crop rotation 4) Maintain field hygiene.",
      soil: "For soil testing: 1) Check pH with pH meter 2) Monitor moisture levels 3) Test NPK levels 4) Use our Soil Analysis tool.",
      fertilizer:
        "Fertilizer amounts vary by crop: 1) Rice - 120:60:40 NPK per hectare 2) Wheat - 150:75:50 NPK per hectare.",
      default:
        "That's an interesting question! Please provide more details or contact our experts for specialized guidance.",
    },
  };

  const langResponses = responses[language] || responses.en;

  // Intent detection
  let intent = "general";
  let response = langResponses.default;

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("नमस्ते") ||
    lowerMessage.includes("नमस्कार")
  ) {
    intent = "greeting";
    response = langResponses.greeting;
  } else if (
    lowerMessage.includes("pest") ||
    lowerMessage.includes("कीट") ||
    lowerMessage.includes("कीड")
  ) {
    intent = "pest_management";
    response = langResponses.pest;
  } else if (
    lowerMessage.includes("soil") ||
    lowerMessage.includes("मिट्टी") ||
    lowerMessage.includes("माती")
  ) {
    intent = "soil_analysis";
    response = langResponses.soil;
  } else if (
    lowerMessage.includes("fertilizer") ||
    lowerMessage.includes("उर्वरक") ||
    lowerMessage.includes("खत")
  ) {
    intent = "fertilizer";
    response = langResponses.fertilizer;
  }

  return {
    content: response,
    metadata: {
      intent,
      confidence: 0.8,
      responseTime: Math.random() * 1000 + 500, // Simulate response time
      source: "rule_based",
    },
  };
};

// @desc    Create new chatbot session
// @route   POST /api/chatbot/session
// @access  Public
export const createSession = async (req, res, next) => {
  try {
    const sessionId = uuidv4();
    const { language = "en", deviceInfo } = req.body;

    const conversation = await ChatbotConversation.create({
      sessionId,
      context: {
        userPreferences: {
          language,
        },
      },
      analytics: {
        deviceInfo,
      },
    });

    // Send initial greeting
    const greeting = generateResponse("hello", language);
    conversation.messages.push({
      type: "bot",
      content: greeting.content,
      language,
      metadata: greeting.metadata,
    });

    await conversation.save();

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        message: greeting.content,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Public/Private
export const sendMessage = async (req, res, next) => {
  try {
    const { sessionId, message, language = "en" } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: { message: "Session ID and message are required" },
      });
    }

    let conversation = await ChatbotConversation.findOne({ sessionId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { message: "Session not found" },
      });
    }

    // Add user message
    conversation.messages.push({
      type: "user",
      content: message,
      language,
    });

    // If user is authenticated, associate with user
    if (req.user) {
      conversation.user = req.user.id;
    }

    // Generate bot response
    const botResponse = generateResponse(
      message,
      language,
      conversation.context,
    );

    // Add bot response
    conversation.messages.push({
      type: "bot",
      content: botResponse.content,
      language,
      metadata: botResponse.metadata,
    });

    // Update context based on detected intent
    if (botResponse.metadata.intent) {
      conversation.context.currentTopic = botResponse.metadata.intent;
    }

    await conversation.save();

    // Emit real-time response if socket is available
    if (req.io && req.user) {
      req.io.to(`user_${req.user.id}`).emit("chatbot_response", {
        sessionId,
        message: botResponse.content,
        metadata: botResponse.metadata,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: botResponse.content,
        metadata: botResponse.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation by session ID
// @route   GET /api/chatbot/conversation/:sessionId
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const conversation = await ChatbotConversation.findOne({
      sessionId: req.params.sessionId,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { message: "Conversation not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for user
// @route   GET /api/chatbot/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const conversations = await ChatbotConversation.find({
      user: req.user.id,
    })
      .select("sessionId analytics.startedAt analytics.totalMessages status")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ChatbotConversation.countDocuments({
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: {
        conversations,
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

// @desc    End chatbot session
// @route   POST /api/chatbot/conversation/:sessionId/end
// @access  Private
export const endSession = async (req, res, next) => {
  try {
    const conversation = await ChatbotConversation.findOne({
      sessionId: req.params.sessionId,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { message: "Conversation not found" },
      });
    }

    conversation.status = "resolved";
    conversation.analytics.endedAt = new Date();
    conversation.analytics.duration = Math.floor(
      (conversation.analytics.endedAt - conversation.analytics.startedAt) /
        1000,
    );

    await conversation.save();

    res.status(200).json({
      success: true,
      data: { message: "Session ended successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate conversation
// @route   POST /api/chatbot/conversation/:sessionId/rate
// @access  Private
export const rateConversation = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;

    const conversation = await ChatbotConversation.findOne({
      sessionId: req.params.sessionId,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { message: "Conversation not found" },
      });
    }

    conversation.satisfaction = {
      rating,
      feedback,
      ratedAt: new Date(),
    };

    await conversation.save();

    res.status(200).json({
      success: true,
      data: { message: "Rating submitted successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Escalate to expert
// @route   POST /api/chatbot/conversation/:sessionId/escalate
// @access  Private
export const escalateToExpert = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const conversation = await ChatbotConversation.findOne({
      sessionId: req.params.sessionId,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { message: "Conversation not found" },
      });
    }

    conversation.status = "escalated";
    conversation.escalation = {
      isEscalated: true,
      reason,
      escalatedAt: new Date(),
    };

    await conversation.save();

    res.status(200).json({
      success: true,
      data: { message: "Conversation escalated to expert successfully" },
    });
  } catch (error) {
    next(error);
  }
};
