
var express = require('express');
var router = express.Router();
let createError = require('http-errors');

let UserRole = require('../../models/auth/userrole');
let User = require('../../models/auth/user');
let auth = require('../../services/auth');
let logger = require('../../services/logger');

let Room = require('../../models/room');
let RoomCategory = require('../../models/masterdata/roomcategory');
let RoomFeature = require('../../models/masterdata/roomfeature');
let RoomService = require('../../models/masterdata/roomservice');


/**** Room Category Functions ****/

/* GET room category list. */
router.get('/roomcategories', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.MasterData.List){ next(createError(403)); return; }

    //get raw data from data
    let rawRoomCategories = await RoomCategory.find({ "delFlag" : false}).lean()
                            .select({ "Name" : 1 });
    
    res.send(rawRoomCategories);
});
/* POST Create room category. */
router.post('/roomcategories', async (reqe, res, next) => {
    try{
        
        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Create){ next(createError(403)); return; }

        let rawRoomCategory = reqe.body;

        //load main fields
        let newRoomCategory = new RoomCategory(rawRoomCategory);
        newRoomCategory.createdBy = user._id;
        newRoomCategory.updatedBy = user._id;

        //save Category 
        let doc = await newRoomCategory.save();
        let rsObj = { ok : "Room Category has been created.", id : doc._id };
        logger.audit("Master Data", "Create", doc._id, user.id, `A new room category has been created by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot create room category, ${err.message}` }) }

});
/* PATCH update room category. */
router.patch('/roomcategories/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Edit){ next(createError(403)); return; }

        let rawRoomCategory = reqe.body;
        rawRoomCategory.updatedBy = user._id;

        //update data to db
        let doc = await RoomCategory.findOneAndUpdate({ "_id" : reqe.params.id, "delFlag" : false}, rawRoomCategory);
        let rsObj = { ok : "Room category has been updated.", id : doc._id };
        logger.audit("Master Data", "Update", doc._id, user.id, `Room category has been updated by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot update room category, ${err.message}` }); }

});
/* DELETE disable room category. */
router.delete('/roomcategories/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Edit){ next(createError(403)); return; }

        //update data to db
        let delObj = { updatedBy : user._id, delFlag : true };
        let doc = await RoomCategory.findOneAndUpdate({ "_id" : reqe.params.id, "delFlag" : false}, delObj);
        let rsObj = { ok : "Room category has been deleted.",  id : doc._id };
        logger.audit("Master Data", "Delete", doc._id, user.id, `Room category has been deleted by ${user.DisplayName}`);
        res.json(rsObj);


    }catch(err){ res.status(400).json({ error : `Cannot delete room category, ${err.message}` }); }
});


/**** Room Feature Functions ****/

/* GET room feature list. */
router.get('/roomfeatures', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.MasterData.List){ next(createError(403)); return; }

    //get raw data from data
    let rawRoomFeatures = await RoomFeature.find({ "delFlag" : false}).lean()
                            .select({ "Name" : 1 });
    
    res.send(rawRoomFeatures);
});
/* POST Create room feature. */
router.post('/roomfeatures', async (reqe, res, next) => {
    try{
        
        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Create){ next(createError(403)); return; }

        let rawRoomFeature = reqe.body;

        //load main fields
        let newRoomFeature = new RoomFeature(rawRoomFeature);
        newRoomFeature.createdBy = user._id;
        newRoomFeature.updatedBy = user._id;

        //save Category 
        let doc = await newRoomFeature.save();
        let rsObj = { ok : "Room feature has been created.", id : doc._id };
        logger.audit("Master Data", "Create", doc._id, user.id, `A new room feature has been created by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot create room feature, ${err.message}` }) }

});
/* PATCH update room feature. */
router.patch('/roomfeatures/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Edit){ next(createError(403)); return; }

        let rawRoomFeature = reqe.body;
        rawRoomFeature.updatedBy = user._id;

        //update data to db
        let doc = await RoomFeature.findOneAndUpdate({ "_id" : reqe.params.id, "delFlag" : false}, rawRoomFeature);
        let rsObj = { ok : "Room feature has been updated.", id : doc._id };
        logger.audit("Master Data", "Update", doc._id, user.id, `Room feature has been updated by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot update room feature, ${err.message}` }); }

});
/* DELETE disable room feature. */
router.delete('/roomfeatures/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Edit){ next(createError(403)); return; }

        //update data to db
        let delObj = { updatedBy : user._id, delFlag : true };
        let doc = await RoomFeature.findOneAndUpdate({ "_id" : reqe.params.id, "delFlag" : false}, delObj);
        let rsObj = { ok : "Room feature has been deleted.",  id : doc._id };
        logger.audit("Master Data", "Delete", doc._id, user.id, `Room feature has been deleted by ${user.DisplayName}`);
        res.json(rsObj);


    }catch(err){ res.status(400).json({ error : `Cannot delete room feature, ${err.message}` }); }
});


/**** Room Service Functions ****/

/* GET room service list. */
router.get('/roomservices', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.MasterData.List){ next(createError(403)); return; }

    //get raw data from data
    let rawRoomServices = await RoomService.find({ "delFlag" : false}).lean()
                            .select({ "Name" : 1 });
    
    res.send(rawRoomServices);
});
/* POST Create room service. */
router.post('/roomservices', async (reqe, res, next) => {
    try{
        
        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Create){ next(createError(403)); return; }

        let rawRoomService = reqe.body;

        //load main fields
        let newRoomService = new RoomService(rawRoomService);
        newRoomService.createdBy = user._id;
        newRoomService.updatedBy = user._id;

        //save Category 
        let doc = await newRoomService.save();
        let rsObj = { ok : "Room service has been created.", id : doc._id };
        logger.audit("Master Data", "Create", doc._id, user.id, `A new room service has been created by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot create room service, ${err.message}` }) }

});
/* PATCH update room service. */
router.patch('/roomservices/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Edit){ next(createError(403)); return; }

        let rawRoomService = reqe.body;
        rawRoomService.updatedBy = user._id;

        //update data to db
        let doc = await RoomService.findOneAndUpdate({ "_id" : reqe.params.id, "delFlag" : false}, rawRoomService);
        let rsObj = { ok : "Room service has been updated.", id : doc._id };
        logger.audit("Master Data", "Update", doc._id, user.id, `Room service has been updated by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot update room service, ${err.message}` }); }

});
/* DELETE disable room service. */
router.delete('/roomservices/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.MasterData.Edit){ next(createError(403)); return; }

        //update data to db
        let delObj = { updatedBy : user._id, delFlag : true };
        let doc = await RoomService.findOneAndUpdate({ "_id" : reqe.params.id, "delFlag" : false}, delObj);
        let rsObj = { ok : "Room service has been deleted.",  id : doc._id };
        logger.audit("Master Data", "Delete", doc._id, user.id, `Room service has been deleted by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot delete room service, ${err.message}` }); }
});

module.exports = router;