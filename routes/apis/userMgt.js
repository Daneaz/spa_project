
var express = require('express');
var router = express.Router();
let createError = require('http-errors');

let UserRole = require('../../models/auth/userrole');
let User = require('../../models/auth/user');
let auth = require('../../services/auth');
let logger = require('../../services/logger');

/* GET user list. */
router.get('/users', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.UserMgt.List){ next(createError(403)); return; }

    //get raw data from data
    let rawUsers = await User.find({ "delFlag" : false}).lean()
                            .populate("Role")
                            .select({
                                "LoginName"     : 1, 
                                "Email"         : 1, 
                                "DisplayName"   : 1,
                                "Role.Name"     : 1,
                            });
    //fillter & process data for api
    let users = rawUsers.map((i) => {
        delete i.Role.createdAt;
        delete i.Role.updatedAt;
        delete i.Role.delFlag;
        delete i.Role.__v;
        return i;
    });
    
    res.send(users);
});

/* GET user details by id. */
router.get('/users/:id', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.UserMgt.Edit){ next(createError(403)); return; }

    //get raw data from data
    let sUser = await User.findOne({ "_id" : reqe.params.id, "delFlag" : false}).lean()
                            .populate("Role", "Name")
                            .select({
                                "LoginName"     : 1, 
                                "Email"         : 1, 
                                "Mobile"        : 1,
                                "DisplayName"   : 1,
                                "Role.Name"     : 1,
                            });
    
    res.send(sUser);
});

/* GET check user name exist. */
router.get('/loginexists', async (reqe, res, next) => {

    let rs = 'true';
    try{
        let sUser = await User.findOne({"LoginName" : reqe.query.login}).lean().select({"LoginName" : 1});
        if(sUser == null){ rs = 'false' } 
    }catch(err){}
    
    res.send(rs);
});
/* GET check role name exist. */
router.get('/roleexists', async (reqe, res, next) => {

    let rs = 'true';
    try{
        let sRole = await UserRole.findOne({"Name" : reqe.query.name}).lean().select({"Name" : 1});
        if(sRole == null){ rs = 'false' } 
    }catch(err){}
    
    res.send(rs);
});

/* POST Create User. */
router.post('/users', async (reqe, res, next) => {
    try{
        
        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.UserMgt.Create){ next(createError(403)); return; }

        let rawNewUser = reqe.body;

        let sUser = await User.findOne({"LoginName" : rawNewUser.LoginName}).lean().select({"LoginName" : 1});
        if(sUser != null){ throw new Error('login name is already taken.') }

        //load main fields
        let newUser = new User(rawNewUser);
        newUser.createdBy = user._id;
        newUser.updatedBy = user._id;
        
        //load fields by biz logic
        newUser.PassCode = auth.hash(rawNewUser.Password);
        let sRole = await UserRole.findOne({ "Name" : rawNewUser.Role.Name, "delFlag" : false});
        newUser.Role = sRole._id;

        //save user 
        let doc = await newUser.save();
        let rsObj = {
            ok      : "User has been created.", 
            id      : doc._id
        };
        logger.audit("User Mgt", "Create", doc._id, user.id, `A new user has been created by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot create user, ${err.message}` }) }

});

/* PATCH update User. */
router.patch('/users/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.UserMgt.Edit){ next(createError(403)); return; }

        let rawNewUser = reqe.body;

        //load data from db
        let sUser = await User.findOne({ "_id" : reqe.params.id, "delFlag" : false});

        sUser.updatedBy = user._id;
        sUser.LoginName = rawNewUser.LoginName || sUser.LoginName;
        sUser.Email = rawNewUser.Email || sUser.Email;
        sUser.DisplayName = rawNewUser.DisplayName || sUser.DisplayName;
        sUser.Mobile = rawNewUser.Mobile || sUser.Mobile;

        //load fields by biz logic
        if(rawNewUser.Password){ sUser.PassCode = auth.hash(rawNewUser.Password); }
        if(rawNewUser.Role.Name){
            let sRole = await UserRole.findOne({ "Name" : rawNewUser.Role.Name, "delFlag" : false});
            sUser.Role = sRole._id;
        }

        //save user 
        let doc = await sUser.save();
        let rsObj = {
            ok      : "User has been updated.", 
            id      : doc._id
        };
        logger.audit("User Mgt", "Update", doc._id, user.id, `User has been updated by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot update user, ${err.message}` }); }

});

/* DELETE disable User. */
router.delete('/users/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.UserMgt.Delete){ next(createError(403)); return; }

        //load data from db
        let sUser = await User.findOne({ "_id" : reqe.params.id});

        sUser.updatedBy = user._id;
        sUser.delFlag = true;

        //save user 
        let doc = await sUser.save();
        let rsObj = {
            ok      : "User has been deleted.", 
            id      : doc._id
        };
        logger.audit("User Mgt", "Delete", doc._id, user.id, `User has been deleted by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot delete User, ${err.message}` }) }

});

/* GET user list. */
router.get('/roles', async (reqe, res, next) => {

    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.UserMgt.List){ next(createError(403)); return; }

    //get raw data from data
    let rawRoles = await UserRole.find({ "delFlag" : false}).lean()
                            .select({
                                "Name" : 1
                            });
    res.send(rawRoles);
});

/* GET role details by id. */
router.get('/roles/:id', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.UserMgt.Edit){ next(createError(403)); return; }

    //get raw data from data
    let sUserRole = await UserRole.findOne({ "_id" : reqe.params.id, "delFlag" : false}).lean()
                            .select({ "delFlag" : 0, "__v" : 0 });
    
    res.send(sUserRole);
});

/* POST Create Role. */
router.post('/roles', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.UserMgt.Create){ next(createError(403)); return; }

        let rawNewRole = reqe.body;
        
        //check role name exist
        let sRole = await UserRole.findOne({"Name" : rawNewRole.Name}).lean().select({"Name" : 1});
        if(sRole != null){ throw new Error('role name is already taken.') }

        //load main fields
        let newRole = new UserRole(rawNewRole);
        newRole.createdBy = user._id;
        newRole.updatedBy = user._id;
        
        //save role 
        let doc = await newRole.save();
        let rsObj = {
            ok      : "User Role has been created.", 
            id      : doc._id
        };
        logger.audit("User Mgt", "Create", doc._id, user.id, `A new user role has been created by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot create user role, ${err.message}` }) }

});

/* PATCH Update Role. */
router.patch('/roles/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.UserMgt.Edit){ next(createError(403)); return; }

        let rawNewRole = reqe.body;
        //load main fields
        let sRole = await UserRole.findOne({ "_id" : reqe.params.id, "delFlag" : false});
        sRole.updatedBy = user._id;
        
        sRole.Name = rawNewRole.Name || sRole.Name;
        sRole.UserMgt = rawNewRole.UserMgt || sRole.UserMgt;

        //save role 
        let doc = await sRole.save();
        let rsObj = {
            ok      : "User Role has been Updated.", 
            id      : doc._id
        };
        logger.audit("User Mgt", "Update", doc._id, user.id, `User Role has been updated by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot update User Role\r\n ${err.message}` }) }

});

/* DELETE  Role. */
router.delete('/roles/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.UserMgt.Delete){ next(createError(403)); return; }

        //load main fields
        let sRole = await UserRole.findOne({ "_id" : reqe.params.id});
        sRole.updatedBy = user._id;
        
        sRole.delFlag = true;

        //save role 
        let doc = await sRole.save();
        let rsObj = {
            ok      : "User Role has been deleted.", 
            id      : doc._id
        };
        logger.audit("User Mgt", "Deleted", doc._id, user.id, `User Role has been deleted by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.json({ error : `Cannot delete User Role\r\n ${err.message}` }); }

});

module.exports = router;