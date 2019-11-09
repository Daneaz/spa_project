
var express = require('express');
var router = express.Router();
let createError = require('http-errors');

let Staff = require('../../models/auth/staff');
let Invoice = require('../../models/invoice');
let Appointment = require('../../models/appointment');
let logger = require('../../services/logger');



/* GET appointment infomation for invoice . */
router.get('/appointment/:id', async (reqe, res, next) => {
    let staff = await Staff.findById(res.locals.user.id).populate('role');
    if (!staff.role.invoiceMgt.list) { next(createError(403)); return; }

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
        }).populate({
            path: "bookings",
            populate: {
                path: 'client',
            }
        })
    res.send(appointment);
});

/* GET appointment infomation for invoice . */
router.get('/appointmentToInvoice/:id', async (reqe, res, next) => {
    let staff = await Staff.findById(res.locals.user.id).populate('role');
    if (!staff.role.invoiceMgt.list) { next(createError(403)); return; }

    let invoice = await Invoice.findOne({ appointment: reqe.params.id, delFlag: false })
        .populate({
            path: "appointment",
            populate: {
                path: 'bookings',
                populate: {
                    path: 'service',
                }
            }
        }).populate({
            path: "appointment",
            populate: {
                path: 'bookings',
                populate: {
                    path: 'staff',
                }
            }
        }).populate("client")
    res.send(invoice);
});


/* GET invoice list . */
router.get('/invoicelist', async (reqe, res, next) => {
    let staff = await Staff.findById(res.locals.user.id).populate('role');
    if (!staff.role.invoiceMgt.list) { next(createError(403)); return; }

    let invoices = await Invoice.find({ "delFlag": false })
        .populate("client")
    res.send(invoices);
});

/* POST Create invoice . */
router.post('/invoice', async (reqe, res, next) => {
    try {

        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.invoiceMgt.create) { next(createError(403)); return; }

        let invoice = new Invoice(reqe.body);
        invoice.createdBy = staff._id;
        invoice.updatedBy = staff._id;

        Appointment.findByIdAndUpdate(reqe.body.appointment, { checkout: true }, { new: true }).then(async result => {
            if (result.checkout) {
                let doc = await invoice.save();
                let rsObj = { ok: "Invoice has been created.", invoice: doc };
                logger.audit("Invoice Mgt", "Create", doc._id, staff.id, `A new invoice has been created by ${staff.displayName}`);
                res.json(rsObj);
            }
        })

    } catch (err) { res.status(400).json({ error: `Cannot create invoice, ${err.message}` }) }

});

module.exports = router;