/**
 * Room Category Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoomCategorySchema = new Schema({
    Name        : { type: String, unique: true, required: true },
    delFlag     : { type: Boolean, index: true, default: false },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('RoomCategory', RoomCategorySchema );