var express = require('express');
var router = express.Router();
let createError = require('http-errors');


let Staff = require('../../models/auth/staff');
let Client = require('../../models/auth/client');
let auth = require('../../services/auth');
let logger = require('../../services/logger');

router.get('/clients', async (reqe, res, next) => {
    let staff = await Staff.findById(res.locals.user.id).populate('role');
    if (!staff.role.staffMgt.list) { next(createError(403)); return; }

    //get raw data from data
    let rawClients = await Client.find({ "delFlag": false }).lean()
        .select({
            "username": 1,
            "email": 1,
            "mobile": 1,
            "displayName": 1,
            "createdAt": 1,
        });

    res.send(rawClients);
});

module.exports = router;