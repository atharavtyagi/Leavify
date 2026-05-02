const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
    /**
     * Create a single notification and emit it strictly via Socket.io
     */
    static async createNotification(userId, message, type = 'info', io) {
        try {
            const notification = await Notification.create({
                userId,
                message,
                type
            });

            // Emit to connected user room if IO is provided
            if (io) {
                // Assuming socket structure uses userId as room
                io.to(userId.toString()).emit('new_notification', notification);
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Notify all users with the "Manager" role
     */
    static async notifyAllManagers(message, type = 'alert', io) {
        try {
            const managers = await User.find({ role: 'Manager' });
            
            const notifications = managers.map(manager => ({
                userId: manager._id,
                message,
                type
            }));

            const createdNotifications = await Notification.insertMany(notifications);

            if (io) {
                createdNotifications.forEach(notif => {
                    io.to(notif.userId.toString()).emit('new_notification', notif);
                });
            }

            return createdNotifications;
        } catch (error) {
            console.error('Error notifying managers:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;
