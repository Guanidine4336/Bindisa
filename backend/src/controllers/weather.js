// Mock weather data - in real implementation, you'd call external weather APIs

// @desc    Get current weather
// @route   GET /api/weather/current/:lat/:lon
// @access  Public
export const getCurrentWeather = async (req, res, next) => {
  try {
    const { lat, lon } = req.params;

    // Mock current weather data
    const currentWeather = {
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      windDirection: "NW",
      pressure: 1013,
      visibility: 10,
      uvIndex: 6,
      condition: "partly_cloudy",
      description: "Partly cloudy with light winds",
      lastUpdated: new Date(),
    };

    res.status(200).json({
      success: true,
      data: { weather: currentWeather },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weather forecast
// @route   GET /api/weather/forecast/:lat/:lon
// @access  Public
export const getForecast = async (req, res, next) => {
  try {
    const { lat, lon } = req.params;
    const days = parseInt(req.query.days) || 7;

    // Mock forecast data
    const forecast = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temperature: {
        min: 20 + Math.random() * 5,
        max: 30 + Math.random() * 8,
      },
      humidity: 60 + Math.random() * 20,
      precipitation: Math.random() * 10,
      windSpeed: 8 + Math.random() * 10,
      condition: ["sunny", "cloudy", "rainy", "partly_cloudy"][
        Math.floor(Math.random() * 4)
      ],
    }));

    res.status(200).json({
      success: true,
      data: {
        location: { lat: parseFloat(lat), lon: parseFloat(lon) },
        forecast,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weather history
// @route   GET /api/weather/history/:lat/:lon
// @access  Private
export const getWeatherHistory = async (req, res, next) => {
  try {
    const { lat, lon } = req.params;

    // Mock historical data
    const history = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      temperature: {
        min: 18 + Math.random() * 7,
        max: 32 + Math.random() * 6,
      },
      precipitation: Math.random() * 15,
      humidity: 50 + Math.random() * 30,
    }));

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weather alerts
// @route   GET /api/weather/alerts/:lat/:lon
// @access  Private
export const getWeatherAlerts = async (req, res, next) => {
  try {
    const { lat, lon } = req.params;

    // Mock alerts
    const alerts = [
      {
        id: "alert_1",
        type: "heavy_rain",
        severity: "moderate",
        title: "Heavy Rain Expected",
        description: "Heavy rainfall expected in the next 24 hours",
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        recommendations: [
          "Ensure proper drainage in fields",
          "Postpone spraying activities",
          "Harvest ready crops if possible",
        ],
      },
    ];

    res.status(200).json({
      success: true,
      data: { alerts },
    });
  } catch (error) {
    next(error);
  }
};
