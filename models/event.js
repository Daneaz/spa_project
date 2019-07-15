/**
 * Event Data Model
 */

var mongoose = require('mongoose');
var mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var moment = require('moment');

var Schema = mongoose.Schema;

var EventSchema = new Schema({
    Type        : { type: Number, required: true, default: 1 },
    Room        : { type: Schema.Types.ObjectId, index: true, ref: 'Room', required: true },
    Name        : { type: String, required: true },
    Desc        : { type: String },
    Start       : { type: Date, required: true, index: true,},
    End         : { type: Date, required: true, index: true, },
    Status      : { type: String },

    Organizer   : { type: Schema.Types.ObjectId, ref: 'User' }, 
    VIP         : { type: Boolean, default: false },
    NumAttendee : { type: Number },
    Services    : [
        { type: Schema.Types.ObjectId, ref: 'RoomService' } 
    ],
    Recurrence  : {
        Ref     : { type: String },
        Order   : { type: Number },
    },

    delFlag     : { type: Boolean, index: true, default: false },
    createdBy   : { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy   : { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, versionKey: false, toObject: { virtuals: true }, toJSON: { virtuals: true }  });


EventSchema.virtual('TypeName').
    get(function() {
        switch(this.Type) {
            case 0:
                return "Blackout"
            case 1:
                return "Meeting"
        }
    });
    
    EventSchema.plugin(mongooseLeanVirtuals);
module.exports = mongoose.model('Event', EventSchema );