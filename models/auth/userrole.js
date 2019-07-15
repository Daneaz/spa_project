/**
 * User Role Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserRoleSchema = new Schema({
    name        : { type: String, unique: true, required: true },
    userMgt     : {
        list    : { type: Boolean, index: true, default: false },
        create  : { type: Boolean, index: true, default: false },
        edit    : { type: Boolean, index: true, default: false },
        delete  : { type: Boolean, index: true, default: false }
    },
    serviceMgt  : {
        list    : { type: Boolean, index: true, default: false },
        create  : { type: Boolean, index: true, default: false },
        edit    : { type: Boolean, index: true, default: false },
        delete  : { type: Boolean, index: true, default: false }
    },
    Room        : {
        List    : { type: Boolean, index: true, default: false },
        Create  : { type: Boolean, index: true, default: false },
        Edit    : { type: Boolean, index: true, default: false },
        Delete  : { type: Boolean, index: true, default: false },
    },
    Blackout    : {
        List    : { type: Boolean, index: true, default: false },
        Create  : { type: Boolean, index: true, default: false },
        Edit    : { type: Boolean, index: true, default: false },
        Delete  : { type: Boolean, index: true, default: false }
    },
    Meeting     : {
        List        : { type: Boolean, index: true, default: false },
        Create      : { type: Boolean, index: true, default: false },
        Edit        : { type: Boolean, index: true, default: false },
        Delete      : { type: Boolean, index: true, default: false },
        Categories  : [
            { type: Schema.Types.ObjectId, ref: 'RoomCategory' } 
        ],
    },
    WorkReuqest : {
        List    : { type: Boolean, index: true, default: false },
        Create  : { type: Boolean, index: true, default: false },
        Edit    : { type: Boolean, index: true, default: false },
        Delete  : { type: Boolean, index: true, default: false }
    },
    delFlag     : { type: Boolean, index: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model('UserRole', UserRoleSchema );