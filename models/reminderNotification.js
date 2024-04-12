class ReminderNotification {
    constructor(reminderNotificationId, reminderId, notificationId, notificationTime, customMessageId) {
        this.reminderNotificationId = reminderNotificationId;
        this.reminderId = reminderId;
        this.notificationId = notificationId;
        this.notificationTime = notificationTime;
        this.customMessageId = customMessageId;
    }

    static async create(reminderId, notificationId, notificationTime, customMessageId) {
        // Creates a new reminder notification link
        // Params: reminderId, notificationId, notificationTime, customMessageId
        // Returns: ReminderNotification instance or error
    }

    static async findByReminderId(reminderId) {
        // Finds all notifications for a given reminder
        // Params: reminderId
        // Returns: List of ReminderNotification instances or null
    }

    async update(notificationTime, customMessageId) {
        // Updates the notification time and custom message for a reminder notification
        // Params: notificationTime, customMessageId
        // Returns: Updated ReminderNotification instance or error
    }

    async delete() {
        // Deletes a reminder notification link
        // Params: None
        //Returns: Success or error
    }
}