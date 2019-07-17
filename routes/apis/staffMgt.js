
var express = require('express');
var router = express.Router();
let createError = require('http-errors');

let StaffRole = require('../../models/auth/staffrole');
let Staff = require('../../models/auth/staff');
let auth = require('../../services/auth');
let logger = require('../../services/logger');

/* GET user list. */
router.get('/staffs', async (reqe, res, next) => {
    let user = await Staff.findById(res.locals.user.id).populate('role');
    if (!user.role.staffMgt.list) { next(createError(403)); return; }

    //get raw data from data
    let rawUsers = await Staff.find({ "delFlag": false }).lean()
        .populate("role")
        .select({
            "username": 1,
            "email": 1,
            "mobile": 1,
            "displayName": 1,
            "role.name": 1,
        });
    //fillter & process data for api
    // let staffs = rawUsers.map((i) => {
    //     delete i.role.createdAt;
    //     delete i.role.updatedAt;
    //     delete i.role.delFlag;
    //     delete i.role.__v;
    //     return i;
    // });

    res.send(rawUsers);
});
/* GET user list. */
router.get('/totalstaffs', async (reqe, res, next) => {
    let user = await Staff.findById(res.locals.user.id).populate('role');
    if (!user.role.staffMgt.list) { next(createError(403)); return; }

    //get raw data from data
    let totalstaffs = await Staff.count({ "delFlag": false });
    //fillter & process data for api
    // let staffs = rawUsers.map((i) => {
    //     delete i.role.createdAt;
    //     delete i.role.updatedAt;
    //     delete i.role.delFlag;
    //     delete i.role.__v;
    //     return i;
    // });

    res.send({total:totalstaffs});
});

/* GET user details by id. */
router.get('/staffs/:id', async (reqe, res, next) => {
    let user = await Staff.findById(res.locals.user.id).populate('role');
    if (!user.role.staffMgt.edit) { next(createError(403)); return; }

    //get raw data from data
    let sUser = await Staff.findOne({ "_id": reqe.params.id, "delFlag": false }).lean()
        .populate("role", "name")
        .select({
            "username": 1,
            "email": 1,
            "mobile": 1,
            "displayName": 1,
            "role.name": 1,
        });

    res.send(sUser);
});

/* GET check user name exist. */
router.get('/loginexists', async (reqe, res, next) => {

    let rs = 'true';
    try {
        let sUser = await Staff.findOne({ "username": reqe.query.login }).lean().select({ "username": 1 });
        if (sUser == null) { rs = 'false' }
    } catch (err) { }

    res.send(rs);
});
/* GET check role name exist. */
router.get('/roleexists', async (reqe, res, next) => {

    let rs = 'true';
    try {
        let sRole = await StaffRole.findOne({ "name": reqe.query.name }).lean().select({ "name": 1 });
        if (sRole == null) { rs = 'false' }
    } catch (err) { }

    res.send(rs);
});

/* POST Create Staff. */
router.post('/staffs', async (reqe, res, next) => {
    try {

        let user = await Staff.findById(res.locals.user.id).populate('role');
        if (!user.role.staffMgt.create) { next(createError(403)); return; }

        let rawNewUser = reqe.body;

        let sUser = await Staff.findOne({ "username": rawNewUser.username }).lean().select({ "username": 1 });
        if (sUser != null) { throw new Error('login name is already taken.') }

        //load main fields
        let newUser = new Staff(rawNewUser);
        newUser.createdBy = user._id;
        newUser.updatedBy = user._id;

        //load fields by biz logic
        newUser.password = auth.hash(rawNewUser.password);

        let sRole = await StaffRole.findOne({ "name": rawNewUser.role.name, "delFlag": false });
        newUser.role = sRole._id;


        //save user 
        let doc = await newUser.save();
        let rsObj = { ok: "Staff has been created.", id: doc._id };
        logger.audit("Staff Mgt", "Create", doc._id, user.id, `A new user has been created by ${user.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot create user, ${err.message}` }) }

});

/* PATCH update Staff. */
router.patch('/staffs/:id', async (reqe, res, next) => {
    try {

        let user = await Staff.findById(res.locals.user.id).populate('role');
        if (!user.role.staffMgt.edit) { next(createError(403)); return; }

        let rawNewUser = reqe.body;

        //load data from db
        let sUser = await Staff.findOne({ "_id": reqe.params.id, "delFlag": false });

        sUser.updatedBy = user._id;
        sUser.username = rawNewUser.username || sUser.username;
        sUser.email = rawNewUser.email || sUser.email;
        sUser.displayName = rawNewUser.displayName || sUser.displayName;
        sUser.mobile = rawNewUser.mobile || sUser.mobile;

        //load fields by biz logic
        if (rawNewUser.Password) { sUser.password = auth.hash(rawNewUser.Password); }
        if (rawNewUser.role.name) {
            let sRole = await StaffRole.findOne({ "name": rawNewUser.role.name, "delFlag": false });
            sUser.role = sRole._id;
        }

        //save user 
        let doc = await sUser.save();
        let rsObj = { ok: "Staff has been updated.", id: doc._id };
        logger.audit("Staff Mgt", "Update", doc._id, user.id, `Staff has been updated by ${user.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot update user, ${err.message}` }); }

});

/* DELETE disable Staff. */
router.delete('/staffs', async (reqe, res, next) => {
    try {

        let user = await Staff.findById(res.locals.user.id).populate('role');
        if (!user.role.staffMgt.delete) { next(createError(403)); return; }

        //save user 
        let deleteId = [];
        let delObj = { updatedBy: user._id, delFlag: true };
        reqe.body.forEach(async function(deleteObj) {
            let doc = await Staff.findOneAndUpdate({ "_id": deleteObj._id, "delFlag": false }, delObj);
            deleteId.push(doc._id);
            logger.audit("Staff Mgt", "Delete", doc._id, user.id, `Staff has been deleted by ${user.displayName}`);
        });
        
        let rsObj = { ok: "Staff has been deleted.", id: deleteId};
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot delete Staff, ${err.message}` }) }

});

/* GET role list. */
router.get('/roles', async (reqe, res, next) => {

    let user = await Staff.findById(res.locals.user.id).populate('role');
    if (!user.role.staffMgt.list) { next(createError(403)); return; }

    //get raw data from data
    let rawRoles = await StaffRole.find({ "delFlag": false }).lean()
        .select({
            "name": 1
        });
    res.send(rawRoles);
});



/* GET role details by id. */
router.get('/roles/:id', async (reqe, res, next) => {
    let user = await Staff.findById(res.locals.user.id).populate('role');
    if (!user.role.staffMgt.edit) { next(createError(403)); return; }

    //get raw data from data
    let sUserRole = await StaffRole.findOne({ "_id": reqe.params.id, "delFlag": false }).lean()
        .select({ "delFlag": 0, "__v": 0 });

    res.send(sUserRole);
});

/* POST Create Role. */
router.post('/roles', async (reqe, res, next) => {
    try {

        let user = await Staff.findById(res.locals.user.id).populate('role');
        if (!user.role.staffMgt.create) { next(createError(403)); return; }

        let rawNewRole = reqe.body;

        //check role name exist
        let sRole = await StaffRole.findOne({ "name": rawNewRole.name }).lean().select({ "name": 1 });
        if (sRole != null) { throw new Error('role name is already taken.') }

        //load main fields
        let newRole = new StaffRole(rawNewRole);
        newRole.createdBy = user._id;
        newRole.updatedBy = user._id;

        //save role 
        let doc = await newRole.save();
        let rsObj = { ok: "Staff role has been created.", id: doc._id };
        logger.audit("Staff Mgt", "Create", doc._id, user.id, `A new user role has been created by ${user.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot create user role, ${err.message}` }) }

});

/* PATCH Update Role. */
router.patch('/roles/:id', async (reqe, res, next) => {
    try {

        let user = await Staff.findById(res.locals.user.id).populate('role');
        if (!user.role.staffMgt.edit) { next(createError(403)); return; }

        let rawNewRole = reqe.body;
        //load main fields
        let sRole = await StaffRole.findOne({ "_id": reqe.params.id, "delFlag": false });
        sRole.updatedBy = user._id;

        sRole.name = rawNewRole.name || sRole.name;
        sRole.staffMgt = rawNewRole.staffMgt || sRole.staffMgt;
        sRole.MasterData = rawNewRole.MasterData || sRole.MasterData;
        sRole.Room = rawNewRole.Room || sRole.Room;
        sRole.Blackout = rawNewRole.Blackout || sRole.Blackout;
        sRole.Meeting = rawNewRole.Meeting || sRole.Meeting;
        sRole.WorkReuqest = rawNewRole.WorkReuqest || sRole.WorkReuqest;

        //save role 
        let doc = await sRole.save();
        let rsObj = { ok: "Staff Role has been Updated.", id: doc._id };
        logger.audit("Staff Mgt", "Update", doc._id, user.id, `Staff Role has been updated by ${user.displayName}`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot update Staff Role\r\n ${err.message}` }) }

});

/* DELETE  Role. */
router.delete('/roles/:id', async (reqe, res, next) => {
    try {

        let user = await Staff.findById(res.locals.user.id).populate('role');
        if (!user.role.staffMgt.delete) { next(createError(403)); return; }

        //save role 
        let delObj = { updatedBy: user._id, delFlag: true };
        let doc = await StaffRole.findOneAndUpdate({ "_id": reqe.params.id, "delFlag": false }, delObj);
        let rsObj = { ok: "Staff Role has been deleted.", id: doc._id };
        logger.audit("Staff Mgt", "Deleted", doc._id, user.id, `Staff Role has been deleted by ${user.displayName}`);
        res.json(rsObj);

    } catch (err) { res.json({ error: `Cannot delete Staff Role\r\n ${err.message}` }); }

});

module.exports = router;