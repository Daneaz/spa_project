
var express = require('express');
var router = express.Router();
let createError = require('http-errors');

let Staff = require('../../models/auth/staff');
let Invoice = require('../../models/invoice');
let Appointment = require('../../models/appointment');
let logger = require('../../services/logger');

/* GET appointment infomation for invoice . */
router.get('/invoice/:id', async (reqe, res, next) => {
    let staff = await Staff.findById(res.locals.user.id).populate('role');
    if (!staff.role.invoiceMgt.create) { next(createError(403)); return; }

    let appointment = await Appointment.findOne({ "_id": reqe.params.id, "delFlag": false })
        .populate({
            path: "bookings",
            populate: {
                path: 'service',
            }
        }).populate({
            path: "bookings",
            populate: {
                path: 'staff',
            }
        })
    res.send(appointment.bookings);
});



module.exports = router;