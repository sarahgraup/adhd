"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Reminder {
  /** Create a reminder, update db, return new reminder data
   *
   * data should be { reminder_id, user_id, title, message_id,
   * sound_id, category_id, notification_id, date_time_scheduled, repeat_pattern, is_active}
   *
   * returns all
   *
   */

  static async create({
    username,
    categoryId,
    title,
    message,
    soundId,
    notificationId,
    dateTimeScheduled,
    repeatPattern,
    snoozeDuration,
    isActive,
  }) {
    const result = await db.query(
      `
        INSERT INTO reminders (username,
                              title,
                              message_id,
                              sound_id,
                              category_id,
                              notification_id,
                              date_time_scheduled,
                              repeat_pattern,
                              snooze_duration
                              is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            username,
            title,
            message_id AS "message",
            sound_id AS "sound,
            category_id AS "category",
            notification_id AS "notification",
            date_time_scheduled "scheduled"
            repeat_pattern AS "repeatPattern",
            snooze_duration AS "snoozeDuration"
            is_active AS "isActive"`,
      [
        username,
        title,
        message,
        soundId,
        categoryId,
        notificationId,
        dateTimeScheduled,
        repeatPattern,
        snoozeDuration,
        isActive,
      ]
    );
    const reminder = result.rows[0];

    return reminder;
  }

  /**
   *
   * given a reminder, returns data about reminder
   *
   * returns { reminder_id, user_id, title, message_id,
   * sound_id, category_id, notification_id, date_time_scheduled, repeat_pattern, is_active}
   *
   * throws notfounderror if reminder not found
   */
  static async findById(reminderId) {
    const reminderRes = await db.query(
      `
        SELECT r.reminder_id, r.username, r.title, m.content AS message, s.file_path AS sound,
               c.name AS category, n.method_type AS notification_method,
               r.date_time_scheduled, r.repeat_pattern, r.snooze_duration, r.is_active
        FROM reminders AS r
        LEFT JOIN messages AS m ON r.message_id = m.message_id
        LEFT JOIN sounds AS s ON r.sound_id = s.sound_id
        LEFT JOIN categories AS c ON r.category_id = c.category_id
        LEFT JOIN notifications AS n ON r.notification_id = n.notification_id
        WHERE r.reminder_id = $1`,
      [reminderId]
    );

    const reminder = reminderRes.rows[0];

    if (!reminder) throw new NotFoundError(`no reminder: ${reminderId}`);

    return reminder;
  }

  /** Update reminder data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   {title, message_id,
   * sound_id, category_id, notification_id, date_time_scheduled, repeat_pattern, is_active}
   *
   * Returns {reminder_id, user_id, title, message_id,
   * sound_id, category_id, notification_id, date_time_scheduled, repeat_pattern, is_active }
   *
   * Throws NotFoundError if not found.
   *
   */
  async updateReminder(reminderId, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      message: "message_id",
      sound: "sound_id",
      category: "category_id",
      notification: "notification_id",
      scheduled: "date_time_scheduled",
      repeatPattern: "repeat_pattern",
      snoozeDuration: "snooze_duration",
      isActive: "is_active",
    });

    const reminderVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE reminders
        SET ${setCols}
        WHERE reminder_id = ${reminderVarIdx}
        RETURNING reminder,
                  user_id,
                  title,
                  message_id AS "message",
                  sound_id AS "sound,
                  category_id AS "category",
                  notification_id AS "notification",
                  date_time_scheduled "scheduled"
                  repeat_pattern AS "repeatPattern",
                  snooze_duration AS "snoozeDuration"
                  is_active AS "isActive"`;

    const result = await db.query(querySql, [...values, reminderId]);
    const reminder = result.rows[0];

    if (!reminder) throw new NotFoundError(`no reminder: ${reminderId}`);

    return reminder;
  }

  /**
   *updates reminder is_active to false
  returns {reminder_id, user_id, title, message_id,
   * sound_id, category_id, notification_id, date_time_scheduled, repeat_pattern, is_active }
   *
   * Throws NotFoundError if not found.
   */
  async toggleActive(reminderId) {
    const reminderRes = await db.query(
      `
        UPDATE reminders
        SET is_active = NOT is_active
        WHERE reminder_id = $1
        RETURNING reminder_id,
                  user_id,
                  title,
                  message_id AS "message",
                  sound_id AS "sound,
                  category_id AS "category",
                  notification_id AS "notification",
                  date_time_scheduled "scheduled"
                  repeat_pattern AS "repeatPattern",
                  snooze_duration AS "snoozeDuration"
                  is_active AS "isActive" `,
      [reminderId]
    );

    const reminder = reminderRes.rows[0];

    if (!reminder) throw new NotFoundError(`No reminder: ${reminderId}`);

    return reminder;
  }

  /**deletes given reminder from database
   * returns undefined
   */
  async delete(reminderId) {
    let result = await db.query(
      `
          DELETE
          FROM reminders
          WHERE reminder_id = $1
          RETURNING reminder_id`,
      [reminderId]
    );

    const reminder = result.rows[0];

    if (!reminder) throw new NotFoundError(`no reminder: ${reminderId}`);
  }
}

module.exports = Reminder;