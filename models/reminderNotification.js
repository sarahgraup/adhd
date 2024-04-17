"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class ReminderNotification {
  /**Create a reminder notification, update db, return new reminder notification data
   *
   * data should be { reminder_id, notification_id, notification_time, custom_message_id}
   *
   * returns all
   *
   */
  static async create(
    reminderId,
    notificationId,
    notificationTime,
    customMessageId
  ) {
    const result = await db.query(
      `
            INSERT INTO reminder_notifications (reminder_id,
                                                notification_id,
                                                notification_time,
                                                custom_message_id)
            VALUES ($1, $2, $3, $4)
            RETURNING reminder_notification_id`,
      [reminderId, notificationId, notificationTime, customMessageId]
    );

    const reminderNotification = result.rows[0];

    return reminderNotification;
  }

  /**given a reminder id, returns data about reminder notification
   *
   * returns {reminder_notification_id, notification_id, notification_time,
   *  method_type,
   * custom_message}
   *
   *Throws NotFoundError if not found.
   */
  static async findByReminderId(reminderId) {
    const res = await db.query(
      `SELECT rn.reminder_notification_id, rn.notification_id, rn.notification_time,
                    n.method_type, m.content AS custom_message
             FROM reminder_notifications AS rn
             JOIN notifications AS n ON rn.notification_id = n.notification_id
             LEFT JOIN messages AS m ON rn.custom_message_id = m.message_id
             WHERE rn.reminder_id = $1`,
      [reminderId]
    );

    const reminderNotification = res.rows[0];

    if (!reminderNotification)
      throw new NotFoundError(`no reminder: ${reminderId}`);

    return reminderNotification;
  }

  /**updates reminder notification based on data
   *  This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   * 
   * 
   * data can include:
   *    {notification_time, custom_message_id}
   * 
   * throws notfounderror if not found
   */
  async update(reminderNotificationId, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      notificationId: "notification_id",
      notificationTime: "notification_time",
      customMessageId: "custom_message_id",
    });

    const reminderNotificationVarIdx = "$" + (values.length + 1);

    const querySql = `
            UPDATE reminder_notifications
            SET ${setCols}
            WHERE reminder_notification_id = ${reminderNotificationVarIdx}
            RETURNING reminder_notification_id,
                      reminder_id,
                      notification_id,
                      notification_time,
                      custom_message_id`;

    const result = await db.query(querySql, [
      ...values,
      reminderNotificationId,
    ]);
    const reminderNotification = result.rows[0];

    if (!reminderNotification) {
      throw new NotFoundError(
        `No reminder notification found with ID: ${reminderNotificationId}`
      );
    }

    return reminderNotification;
  }

  /**deletes reminder notificaiton given reminder notification id */
  async delete(reminderNotificationId) {
    let result = await db.query(
      `
          DELETE
          FROM reminder_notifications
          WHERE reminder_notification_id = $1
          RETURNING reminder_notification_id`,
      [reminderNotificationId]
    );

    const rn = result.rows[0];

    if (!rn)
      throw new NotFoundError(
        `no reminder notification: ${reminderNotificationId}`
      );
  }
}

module.exports = ReminderNotification;
