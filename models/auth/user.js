/**
 * User Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    LoginName   : { type: String, lowercase: true, unique: true, required: true },
    PassCode    : { type: String, required: true },
    Email       : { type: String, lowercase: true, required: true },
    Mobile      : { type: String, lowercase: true },
    DisplayName : { type: String, required: true },
    Role        : { type: Schema.Types.ObjectId, ref: 'UserRole', required: true },
    delFlag     : { type: Boolean, index: true, default: false }
}, { timestamps: true });
//UserSchema.path('updatedAt').index({ expires: 120 });

module.exports = mongoose.model('User', UserSchema );