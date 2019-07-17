
var express = require('express');
var router = express.Router();
let createError = require('http-errors');

let Service = require('../../models/service');
let Staff = require('../../models/auth/staff');

let logger = require('../../services/logger');

/* GET service list. */
router.get('/services', async (reqe, res, next) => {
    let user = await Staff.findById(res.locals.user.id).populate('role');
    if (!user.role.serviceMgt.list) { next(createError(403)); return; }

    //get raw data from data
    let services = await Service.find({ "delFlag": false }).lean()
        .populate("staff")
        .select({
            "name": 1,
            "duration": 1,
            "price": 1,
            "staff": 1,
        });
    res.send(services);
});

/* GET service list. */
router.get('/services/:id', async (reqe, res, next) => {
    let user = await Staff.findById(res.locals.user.id).populate('role');
    if (!user.role.serviceMgt.list) { next(createError(403)); return; }

    //get raw data from data
    let services = await Service.findOne({ "_id": reqe.params.id, "delFlag": false }).lean()
        .populate("staff")
        .select({
            "name": 1,
            "duration": 1,
            "price": 1,
            "staff": 1,
        });
    res.send(services);
});

/* Create service. */
router.post('/services', async (reqe, res, next) => {
    try {

        let user = await Staff.findById(res.locals.user.id).populate('role');
        if (!user.role.staffMgt.create) { next(createError(403)); return; }

        let rawNewService = reqe.body;

        let sService = await Service.findOne({ "name": rawNewService.name }).lean().select({ "name": 1 });
        if (sService != null) { throw new Error('Service name is already taken.') }

        //load main fields
        let newService = new Service(rawNewService);

        //save service 
        let doc = await newService.save();
        let rsObj = { ok: "User has been created.", id: doc._id };
        logger.audit("User Mgt", "Create", doc._id, user.id, `A new user has been created by ${user.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot create user, ${err.message}` }) }

});

module.exports = router;