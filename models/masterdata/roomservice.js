/**
 * Room Service Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoomServiceSchema = new Schema({
    Name        : { type: String, unique: true, required: true },
    Email       : { type: String },
    delFlag     : { type: Boolean, index: true, default: false },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('RoomService', RoomServiceSchema );