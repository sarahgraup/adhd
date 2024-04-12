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
    // const duplicateCheck = await db.query(
    //   `
    //     SELECT handle
    //     FROM companies
    //     WHERE handle = $1`,
    //   [handle]
    // );

    // if (duplicateCheck.rows[0])
    //   throw new BadRequestError(`Duplicate company: ${handle}`);

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

  static async findById(reminderId) {
    // Finds a reminder by ID
    // Params: reminderId
    // Returns: Reminder instance or null
  }

  async updateTitle(newTitle) {
    // Updates the title of the reminder
    // Params: newTitle
    // Returns: Updated Reminder instance or error
  }

  async deactivate() {
    // Deactivates the reminder
    // Params: None
    // Returns: Updated Reminder instance or error
  }

  async delete() {
    // Deletes the reminder
    // Params: None
    // Returns: Success or error
  }
}