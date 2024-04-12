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

class Category {
  constructor(categoryId, userId, defaultSound, defaultNotificationType) {
    this.categoryId = categoryId;
    this.userId = userId;
    this.defaultSound = defaultSound;
    this.defaultNotificationType = defaultNotificationType;
  }

  static async create(userId, defaultSound, defaultNotificationType) {
    // Creates a new category
    // Params: userId, defaultSound, defaultNotificationType
    // Returns: Category instance or error
  }

  static async findById(categoryId) {
    // Finds a category by ID
    // Params: categoryId
    // Returns: Category instance or null
  }

  async updateDefaultSound(newSound) {
    // Updates the default sound for the category
    // Params: newSound
    // Returns: Updated Category instance or error
  }

  async delete() {
    // Deletes the category
    // Params: None
    // Returns: Success or error
  }
}

module.exports = Category;
