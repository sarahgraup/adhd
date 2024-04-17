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
    userId,
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
        INSERT INTO reminder (user_id,
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
            user_id,
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
        userId,
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
          SELECT reminder,
                  user_id,
                  title,
                  message_id AS "message",
                  sound_id AS "sound,
                  category_id AS "category",
                  notification_id AS "notification",
                  date_time_scheduled "scheduled"
                  repeat_pattern AS "repeatPattern",
                  snooze_duration AS "snoozeDuration"
                  is_active AS "isActive"
          FROM reminders
          WHERE reminder = $1`,
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
        WHERE reminder = ${reminderVarIdx}
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

    const result = await db.que4ry(querySql, [...values, reminderId]);
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
  async deactivate(reminderId) {
    const reminderRes = await db.query(
      `
        UPDATE reminders
        SET is_active = false
        WHERE reminder = $1
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
          WHERE reminder = $1
          RETURNING reminder`,
      [reminderId]
    );

    const reminder = result.rows[0];

    if (!reminder) throw new NotFoundError(`no reminder: ${reminderId}`);
  }
}

module.exports = Reminder;