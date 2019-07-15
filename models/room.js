/**
 * Meeting Room Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    Name            : { type: String, unique: true, required: true },
    Location        : { type: String },
    Capacity        : { type: Number },
    Email           : { type: String },
    Phone           : { type: String },
    CalendarToken   : { type: String },
    Category        : { type: Schema.Types.ObjectId, ref: 'RoomCategory', required: true },
    Features        : [ 
        { type: Schema.Types.ObjectId, ref: 'RoomFeature' } 
    ],
    delFlag         : { type: Boolean, index: true, default: false },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Room', RoomSchema );