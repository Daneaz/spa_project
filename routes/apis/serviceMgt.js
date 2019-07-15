
var express = require('express');
var router = express.Router();
let createError = require('http-errors');

let Service = require('../../models/service');
let User = require('../../models/auth/user');

let logger = require('../../services/logger');

/* GET service list. */
router.get('/services', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('role');
    if (!user.role.ServiceMgt.List) { next(createError(403)); return; }

    //get raw data from data
    let services = await Service.find({ "delFlag": false }).lean()
        .populate("User")
        .select({
            "name": 1,
            "duration": 1,
            "price": 1,
            "Staff": 1,
        });

    res.send(services);
});

/* Create service. */
router.post('/services', async (reqe, res, next) => {
    try {

        let user = await User.findById(res.locals.user.id).populate('role');
        if (!user.role.userMgt.create) { next(createError(403)); return; }

        let rawNewService = reqe.body;

        let sService = await Service.findOne({ "name": rawNewService.name }).lean().select({ "name": 1 });
        if (sUser != null) { throw new Error('Service name is already taken.') }

        //load main fields
        let newService = new Service(rawNewService);
        newUser.createdBy = user._id;
        newUser.updatedBy = user._id;

        //save user 
        let doc = await newService.save();
        let rsObj = { ok: "User has been created.", id: doc._id };
        logger.audit("User Mgt", "Create", doc._id, user.id, `A new user has been created by ${user.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot create user, ${err.message}` }) }

});

