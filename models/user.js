"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");


const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `
        SELECT username,
               password,
               first_name AS "firstName",
               last_name  AS "lastName",
               email,
               number
        FROM users
        WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, number }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    number,
  }) {
    const duplicateCheck = await db.query(
      `
        SELECT username
        FROM users
        WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `
                INSERT INTO users
                (username,
                 password,
                 first_name,
                 last_name,
                 email,
                 number)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING
                    username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    number`,
      [username, hashedPassword, firstName, lastName, email, number]
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  // static async findAll() {
  //   const result = await db.query(`
  //       SELECT username,
  //              first_name AS "firstName",
  //              last_name  AS "lastName",
  //              email,
  //              is_admin   AS "isAdmin"
  //       FROM users
  //       ORDER BY username`);

  //   return result.rows;
  // }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name,  }
   *   where reminder is {  reminder_id, user_id, title, message_id,
   * sound_id, category_id, notification_id, date_time_scheduled, repeat_pattern, is_active}
   *    where category is {}
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `
        SELECT username,
               first_name AS "firstName",
               last_name  AS "lastName",
               email,
               number
        FROM users
        WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    // const userApplicationsRes = await db.query(
    //   `
    //     SELECT a.job_id
    //     FROM applications AS a
    //     WHERE a.username = $1`,
    //   [username]
    // );

    // user.applications = userApplicationsRes.rows.map((a) => a.job_id);
    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, number }
   *
   * Returns { username, firstName, lastName, email, number }
   *
   * Throws NotFoundError if not found.
   *
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      number: "number",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE users
        SET ${setCols}
        WHERE username = ${usernameVarIdx}
        RETURNING username,
            first_name AS "firstName",
            last_name AS "lastName",
            email,
            number`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `
        DELETE
        FROM users
        WHERE username = $1
        RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = User;
