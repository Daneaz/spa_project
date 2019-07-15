/**
 * User Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username   : { type: String, lowercase: true, unique: true, required: true },
    password    : { type: String, required: true },
    email       : { type: String, lowercase: true, required: true },
    mobile      : { type: String, lowercase: true },
    displayName : { type: String, required: true },
    Role        : { type: Schema.Types.ObjectId, ref: 'UserRole', required: true },
    delFlag     : { type: Boolean, index: true, default: false }
}, { timestamps: true });
//UserSchema.path('updatedAt').index({ expires: 120 });

module.exports = mongoose.model('User', UserSchema );