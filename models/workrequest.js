/**
 * Room Work Request Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var WorkRequestSchema = new Schema({
    Room        : { type: Schema.Types.ObjectId, ref: 'WorkRequest', required: true },
    Desc        : { type: String },
    Type        : { type: String }, //Cleaning, Issue
    Status      : { type: String }, //Requested, In Progress, Completed
    Items       : [ { String } ],
    delFlag     : { type: Boolean, index: true, default: false },
    createdBy   : { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy   : { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, versionKey: false  });

module.exports = mongoose.model('WorkRequest', WorkRequestSchema );