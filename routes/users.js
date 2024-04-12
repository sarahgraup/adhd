"use strict";

/** Routes for users. 
 * POST /users/register - Register a new user.
POST /users/login - Authenticate a user.
GET /users/profile - Retrieve the authenticated user's profile.
PUT /users/profile - Update the authenticated user's profile.
DELETE /users/profile - Delete the authenticated user's account.
*/

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userRegister.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();



/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, categories, reminders }
 *   where categories is { }
 *      and reminders is { }
 *
 * Authorization required: same user-as-:username
 **/

router.get(
  "/:username",
  ensureCorrectUser,
  async function (req, res, next) {
    const user = await User.get(req.params.username);
    return res.json({ user });
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch(
  "/:username",
  ensureCorrectUser,
  async function (req, res, next) {
    const validator = jsonschema.validate(req.body, userUpdateSchema, {
      required: true,
    });
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  }
);

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete(
  "/:username",
  ensureCorrectUser,
  async function (req, res, next) {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  }
);

// /** POST /[username]/jobs/[id]  { state } => { application }
//  *
//  * Returns {"applied": jobId}
//  *
//  * Authorization required: admin or same-user-as-:username
//  * */

// router.post(
//   "/:username/jobs/:id",
//   ensureCorrectUser,
//   async function (req, res, next) {
//     const jobId = +req.params.id;
//     await User.applyToJob(req.params.username, jobId);
//     return res.json({ applied: jobId });
//   }
// );

module.exports = router;
