/**
 * Bookings Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookingSchema = new Schema({
    serviceName: { type: String, required: true },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true, index: true },
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    resource: { type: Object, required: true },
    allDay: { type: Boolean, index: true, default: false },
    delFlag: { type: Boolean, index: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);