/**
 * Service Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ServiceSchema = new Schema({
    name            : { type: String, unique: true, required: true },
    duration        : { type: Number },
    price           : { type: Number },
    Staff           : [ 
        { type: Schema.Types.ObjectId, ref: 'User', required: true } 
    ],
    delFlag         : { type: Boolean, index: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema );