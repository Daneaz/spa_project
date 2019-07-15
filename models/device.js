/**
 * Device Infomation Data Model
 */

var mongoose = require('mongoose');
var mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var moment = require('moment');

var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    UID         : { type: String, required: true, index: true },
    PairingCode : { type: String, required: true },
    Hardware    : {
        Model       : { type: String },
        Brand       : { type: String },
    },
    Software : {
        Ver         : { type: String },
    },
    Room        : { type: Schema.Types.ObjectId, ref: 'Room' },
    Status : {
        RegIP       : { type: String },
        LastCommAt  : { type: Date },
        LastIP      : { type: String },
    },
    delFlag     : { type: Boolean, index: true, default: false },    
    createdBy   : { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy   : { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, versionKey: false, toObject: { virtuals: true }, toJSON: { virtuals: true } });


DeviceSchema.virtual('Status.Online').
    get(function() {
        if(!this.Status || !this.LastCommAt){ return false }
        //return status online if last comunication within 10 mins
        return moment(this.Status.LastCommAt).add(10, 'm').isAfter(moment());
    });

DeviceSchema.plugin(mongooseLeanVirtuals);
module.exports = mongoose.model('Device', DeviceSchema );