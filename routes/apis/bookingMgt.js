var express = require('express');
var router = express.Router();
let createError = require('http-errors');


let Staff = require('../../models/auth/staff');
let Booking = require('../../models/booking');
let Appointment = require('../../models/appointment');
let logger = require('../../services/logger');

/* GET booking list. */
router.get('/bookings', async (reqe, res, next) => {
    try {
        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.bookingMgt.list) { next(createError(403)); return; }

        // return and rename the data as calender needs
        let bookings = await Booking.aggregate([
            { $match: { delFlag: false } },
            {
                $project: {
                    "id": "$_id",
                    "resourceId": "$staff",
                    "resource": "$client",
                    "appointment": 1,
                    "title": 1,
                    "client": 1,
                    "service": 1,
                    "start": 1,
                    "end": 1,
                }
            }
        ])
        res.send(bookings);
    } catch(err) { res.status(400).json({ error: `Cannot get bookings, ${err.message}` }) }
});

/* GET booking list. */
router.get('/appointment/:id', async (reqe, res, next) => {
    try {
        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.bookingMgt.list) { next(createError(403)); return; }

        // return and rename the data as calender needs
        let appointment = await Appointment.findOne({ "_id": reqe.params.id, "delFlag": false }).populate("bookings");
        res.send(appointment);
    } catch(err) { res.status(400).json({ error: `Cannot get appointment, ${err.message}` }) }
});

/* GET available staff list. */
router.post('/availablestaff', async (reqe, res, next) => {
    try {
        //get raw data from data
        let service = reqe.body;
        let startTime = new Date(service.start)
        let endTime = new Date(service.end)
        let staffs = service.staff;
        let staffList = []
        let todayDate = new Date(startTime.toDateString());
        for (let i = 0; i < staffs.length; i++) {
            let bookings = await Booking.find({ staff: staffs[i]._id, start: { $gte: todayDate }, delFlag: false });
            if (bookings.length <= 0) {
                staffList.push(staffs[i])
                continue;
            }
            let conflit = false;
            for (let j = 0; j < bookings.length; j++) {
                if ((bookings[j].end > startTime && startTime > bookings[j].start) || (bookings[j].end > endTime && endTime > bookings[j].start)) {
                    conflit = true
                }
            }
            if (!conflit) {
                staffList.push(staffs[i])
            }
        }
        res.send(staffList);
    } catch(err) { res.status(400).json({ error: `Cannot get availablestaff, ${err.message}` }) }
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

/* POST Create booking. */
router.post('/bookinglist', async (reqe, res, next) => {
    try {

        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.bookingMgt.create) { next(createError(403)); return; }
        (new Appointment).save().then(app => {
            //load main fields
            reqe.body.map(booking => {
                booking.appointment = app._id
                return booking
            })
            Booking.insertMany(reqe.body).then(doc => {
                let bookingids = doc.map(booking => {
                    return booking._id
                })
                app.bookings = bookingids
                app.save()
                let rsObj = { ok: "Booking has been created.", booking: doc }
                logger.audit("Booking Mgt", "Create", doc._id, staff.id, `A new booking has been created by ${staff.displayName}`)
                res.json(rsObj)
            }).catch(err => {
                res.status(400).json({ error: `Cannot create booking, ${err.message}` })
            })

        })

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
        booking.title = rawBooking.title || booking.title;
        booking.start = rawBooking.start || booking.start;
        booking.end = rawBooking.end || booking.end;
        booking.staff = rawBooking.staff || booking.staff;
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