// Mock notifications - in real implementation, you'd have a Notification model

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Mock notifications
    const notifications = [
      {
        id: "1",
        title: "Soil Analysis Complete",
        message: "Your soil analysis report is ready for review",
        type: "info",
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "Weather Alert",
        message: "Heavy rain expected in your area tomorrow",
        type: "warning",
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total: notifications.length,
          pages: Math.ceil(notifications.length / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { message: "Notification marked as read" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { message: "All notifications marked as read" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { message: "Notification deleted successfully" },
    });
  } catch (error) {
    next(error);
  }
};
