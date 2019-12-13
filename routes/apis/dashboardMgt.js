var express = require('express');
var router = express.Router();
let createError = require('http-errors');

let Staff = require('../../models/auth/staff');
let Client = require('../../models/auth/client');
let Booking = require('../../models/booking');
let Appointment = require('../../models/appointment');
let CreditRecord = require('../../models/creditRecord');
let logger = require('../../services/logger');

/* PATCH update add credit. */
router.get('/dashboard', async (reqe, res, next) => {
    try {
        let date = new Date();
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        let bookingsByStaff = await Appointment.aggregate([
            {
                $match: {
                    delFlag: false,
                    createdAt: { $gte: date }
                }
            },
            {
                $lookup:
                {
                    from: "bookings",
                    localField: "bookings",
                    foreignField: "_id",
                    as: "bookings"
                }
            },
            {
                $group:
                {
                    _id: { $arrayElemAt: ["$bookings.staff", 0] },
                    Bookings: { $sum: 1 },
                }
            },
            {
                $lookup:
                {
                    from: "staffs",
                    localField: "_id",
                    foreignField: "_id",
                    as: "staffName"
                }
            },
            {
                $project: 
                {
                    staffName: "$staffName.displayName",
                    Bookings: 1
                }
            }
        ])

        let totalBookings = await Booking.aggregate([
            {
                $match:
                {
                    delFlag: false
                }
            },
            {
                $project:
                {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                }
            },
            {
                $group:
                {
                    _id: "$date",
                    TotalBooking: { $sum: 1 },
                }
            },
            {
                $sort:
                {
                    _id: 1
                }
            }
        ])

        for (let i = 0; i < bookingsByStaff.length; i++) {
            bookingsByStaff[i].staff = bookingsByStaff[i].staffName[0]
        }

        let rsObj = { ok: "Credit has been added.", bookingsByStaff: bookingsByStaff, totalBookings: totalBookings };
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot add credit, ${err.message}` }); }

});

module.exports = router;
