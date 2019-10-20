var express = require('express');
var router = express.Router();
let createError = require('http-errors');


let Staff = require('../../models/auth/staff');
let Booking = require('../../models/booking');
let logger = require('../../services/logger');

/* GET booking list. */
router.get('/bookings', async (reqe, res, next) => {
    let staff = await Staff.findById(res.locals.user.id).populate('role');
    if (!staff.role.bookingMgt.list) { next(createError(403)); return; }

    // return and rename the data as calender needs
    let bookings = await Booking.aggregate([
        { $match: { delFlag: false } },
        {
            $project: {
                "id": "$_id",
                "title": "$serviceName",
                "resourceId": "$staff",
                "resource": "$client",
                "client": 1,
                "service": 1,
                "start": 1,
                "end": 1,
                "allDay": 1,
            }
        }
    ])

    res.send(bookings);
});

/* POST Create booking. */
router.post('/bookings', async (reqe, res, next) => {
    try {

        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.bookingMgt.create) { next(createError(403)); return; }

        //load main fields
        let booking = new Booking(reqe.body);
        booking.createdBy = staff._id;
        booking.updatedBy = staff._id;

        //save client 
        let doc = await booking.save();
        let rsObj = { ok: "Booking has been created.", booking: doc };
        logger.audit("Booking Mgt", "Create", doc._id, staff.id, `A new booking has been created by ${staff.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot create booking, ${err.message}` }) }
});

/* PATCH update booking. */
router.patch('/bookings/:id', async (reqe, res, next) => {
    try {

        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.bookingMgt.edit) { next(createError(403)); return; }

        let rawBooking = reqe.body;

        //load booking from db
        let booking = await Booking.findOne({ "_id": reqe.params.id, "delFlag": false });

        booking.updatedBy = staff._id;
        booking.serviceName = rawBooking.serviceName || booking.serviceName;
        booking.start = rawBooking.start || booking.start;
        booking.end = rawBooking.end || booking.end;
        booking.staff = rawBooking.staff || booking.staff;
        booking.allDay = rawBooking.allDay || booking.allDay;
        booking.client = rawBooking.client || booking.client;
        booking.service = rawBooking.service || booking.service;

        //save booking 
        let doc = await booking.save();
        let rsObj = { ok: "Booking has been updated.", booking: doc };
        logger.audit("Booking Mgt", "Update", doc._id, staff.id, `Booking has been updated by ${staff.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot update booking, ${err.message}` }); }

});

/* DELETE disable booking. */
router.delete('/bookings/:id', async (reqe, res, next) => {
    try {

        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.bookingMgt.delete) { next(createError(403)); return; }

        //load data from db
        let booking = await Booking.findOne({ "_id": reqe.params.id });
        booking.updatedBy = staff._id;
        booking.delFlag = true;
        // //save user 
        let doc = await booking.save();
        let rsObj = {
            ok: "User has been deleted.",
            id: doc._id
        };
        logger.audit("Booking Mgt", "Delete", doc._id, staff.id, `Booking has been deleted by ${staff.DisplayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot delete booking, ${err.message}` }) }

});

module.exports = router;