/**
 * Bookings Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookingSchema = new Schema({
    serviceName: { type: String, unique: true, required: true },
    start: { type: Number },
    end: { type: Number },
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    delFlag: { type: Boolean, index: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Service', BookingSchema);