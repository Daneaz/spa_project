/**
 * Appointment Data Model
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
    bookings: [
        { type: Schema.Types.ObjectId, ref: 'Booking', required: true }
    ],
    delFlag: { type: Boolean, index: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);