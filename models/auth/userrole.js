/**
 * User Role Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserRoleSchema = new Schema({
    Name        : { type: String, unique: true, required: true },
    UserMgt : {
        List    : { type: Boolean, index: true, default: false },
        Create  : { type: Boolean, index: true, default: false },
        Edit    : { type: Boolean, index: true, default: false },
        Delete  : { type: Boolean, index: true, default: false }
    },
    delFlag     : { type: Boolean, index: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model('UserRole', UserRoleSchema );