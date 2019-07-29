/**
 * Client Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ClientSchema = new Schema({
    username   : { type: String, lowercase: true, unique: true, required: true },
    password    : { type: String, required: true },
    email       : { type: String, lowercase: true, required: true },
    mobile      : { type: Number, lowercase: true },
    displayName : { type: String, required: true },
    delFlag     : { type: Boolean, index: true, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema );