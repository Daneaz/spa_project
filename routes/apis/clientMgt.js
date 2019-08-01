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

router.post('/clients', async (reqe, res, next) => {
    try {

        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.staffMgt.create) { next(createError(403)); return; }

        let rawNewClient = reqe.body;

        let sClient = await Client.findOne({ "username": rawNewClient.username }).lean().select({ "username": 1 });
        if (sClient != null) { throw new Error('login name is already taken.') }

        //load main fields
        let newClient = new Client(rawNewClient);
        newClient.createdBy = staff._id;
        newClient.updatedBy = staff._id;

        //load fields by biz logic
        newClient.password = auth.hash(rawNewClient.password);

        //save client 
        let doc = await newClient.save();
        let rsObj = { ok: "Client has been created.", id: doc._id };
        logger.audit("Client Mgt", "Create", doc._id, staff.id, `A new client has been created by ${staff.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot create client, ${err.message}` }) }

});

/* GET client details by username. */
router.get('/clients/:id', async (reqe, res, next) => {
    let staff = await Staff.findById(res.locals.user.id).populate('role');
    if (!staff.role.staffMgt.edit) { next(createError(403)); return; }

    //get raw data from data
    let client = await Client.findOne({ "_id": reqe.params.id, "delFlag": false }).lean()
        .select({
            "username": 1,
            "email": 1,
            "mobile": 1,
            "displayName": 1,
        });

    res.send(client);
});

/* PATCH update client. */
router.patch('/clients/:id', async (reqe, res, next) => {
    try {

        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.staffMgt.edit) { next(createError(403)); return; }

        let rawNewClient = reqe.body;

        //load data from db
        let newClient = await Client.findOne({ "_id": reqe.params.id, "delFlag": false });

        newClient.updatedBy = staff._id;
        newClient.username = rawNewClient.username || newClient.username;
        newClient.email = rawNewClient.email || newClient.email;
        newClient.displayName = rawNewClient.displayName || newClient.displayName;
        newClient.mobile = rawNewClient.mobile || newClient.mobile;

        //load fields by biz logic
        if (rawNewClient.password) { newClient.password = auth.hash(rawNewClient.password); }

        //save user 
        let doc = await newClient.save();
        let rsObj = { ok: "Client has been updated.", id: doc._id };
        logger.audit("Client Mgt", "Update", doc._id, staff.id, `Client has been updated by ${staff.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot update user, ${err.message}` }); }

});

/* DELETE disable Client. */
router.delete('/clients', async (reqe, res, next) => {
    try {

        let staff = await Staff.findById(res.locals.user.id).populate('role');
        if (!staff.role.staffMgt.delete) { next(createError(403)); return; }

        //save user 
        let deleteId = [];
        let delObj = { updatedBy: staff._id, delFlag: true };
        reqe.body.forEach(async function(deleteObj) {
            let doc = await Client.findOneAndUpdate({ "_id": deleteObj._id, "delFlag": false }, delObj);
            deleteId.push(doc._id);
            logger.audit("Client Mgt", "Delete", doc._id, staff.id, `Client has been deleted by ${staff.displayName}`);
        });
        
        let rsObj = { ok: "Client has been deleted.", id: deleteId};
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot delete Client, ${err.message}` }) }

});

module.exports = router;