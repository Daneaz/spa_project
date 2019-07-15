
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


/* GET room list. */
router.get('/', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.Room.List){ next(createError(403)); return; }

    //get raw data from data
    let rawRooms = await Room.find({ "delFlag" : false}).lean()
                            .populate("Category", "Name")
                            .populate("Features", "Name")
                            .select({
                                "Name"          : 1, 
                                "Location"      : 1, 
                                "Capacity"      : 1
                            });
    //fillter & process data for api
    // let users = rawUsers.map((i) => {
    //     delete i.Role.createdAt;
    //     delete i.Role.updatedAt;
    //     delete i.Role.delFlag;
    //     delete i.Role.__v;
    //     return i;
    // });
    
    res.send(rawRooms);
});
/* GET room details by id. */
router.get('/:id', async (reqe, res, next) => {
    let user = await User.findById(res.locals.user.id).populate('Role');
    if(!user.Role.Room.Edit){ next(createError(403)); return; }

    //get raw data from data
    let sRoom = await Room.findOne({ "_id" : reqe.params.id, "delFlag" : false}).lean()
                            .populate("Category", "Name")
                            .populate("Features", "Name")
                            .select({
                                "Name"      : 1, 
                                "Location"  : 1, 
                                "Capacity"  : 1,
                                "Email"     : 1,
                                "Phone"     : 1,
                            });
    
    res.send(sRoom);
});
/* POST Create room. */
router.post('/', async (reqe, res, next) => {
    try{
        
        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.Room.Create){ next(createError(403)); return; }

        let rawRoom = reqe.body;

        //load main fields
        let newRoom = new Room(rawRoom);
        newRoom.createdBy = user._id;
        newRoom.updatedBy = user._id;

        //load fields by biz logic
        let sRoomCategory = await RoomCategory.findOne({ "Name" : rawRoom.Category.Name, "delFlag" : false});
        newRoom.Category = sRoomCategory._id;

        if(rawRoom.Features){
            newRoom.Features = [];
            for (i = 0; i < rawRoom.Features.length; i++) {
                let sRoomFeature = await RoomFeature.findOne({ "Name" : rawRoom.Features[i].Name, "delFlag" : false});
                newRoom.Features[i] = sRoomFeature._id;
            }
        }

        //save Category 
        let doc = await newRoom.save();
        let rsObj = { ok : "Room has been created.", id : doc._id };
        logger.audit("Master Data", "Create", doc._id, user.id, `A new room has been created by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot create room, ${err.message}` }) }

});
/* PATCH update room. */
router.patch('/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.Room.Edit){ next(createError(403)); return; }

        let rawRoom = reqe.body;

        //load data from db
        let sRoom = await Room.findOne({ "_id" : reqe.params.id, "delFlag" : false});

        sRoom.updatedBy = user._id;
        sRoom.Name = rawRoom.Name || sRoom.Name;
        sRoom.Location = rawRoom.Location || undefined;
        sRoom.Capacity = rawRoom.Capacity || undefined;
        sRoom.Email = rawRoom.Email || undefined;
        sRoom.Phone = rawRoom.Phone || undefined;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
        sRoom.Category = rawRoom.DeviceToken || sRoom.DeviceToken;

        let sRoomCategory = await RoomCategory.findOne({ "Name" : rawRoom.Category.Name, "delFlag" : false});
        if(sRoomCategory){ sRoom.Category = sRoomCategory._id }

        if(rawRoom.Features){
            sRoom.Features = [];
            for (i = 0; i < rawRoom.Features.length; i++) {
                let sRoomFeature = await RoomFeature.findOne({ "Name" : rawRoom.Features[i].Name, "delFlag" : false});
                sRoom.Features[i] = sRoomFeature._id;
            }
        }


        //save user 
        let doc = await sRoom.save();
        let rsObj = { ok : "Room has been updated.", id : doc._id };
        logger.audit("Master Data", "Update", doc._id, user.id, `Room has been updated by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot update room, ${err.message}` }); }

});
/* DELETE disable room. */
router.delete('/:id', async (reqe, res, next) => {
    try{

        let user = await User.findById(res.locals.user.id).populate('Role');
        if(!user.Role.Room.Edit){ next(createError(403)); return; }

        //update data to db
        let delObj = { updatedBy : user._id, delFlag : true };
        let doc = await Room.findOneAndUpdate({ "_id" : reqe.params.id, "delFlag" : false}, delObj);
        let rsObj = { ok : "Room has been deleted.", id : doc._id };
        logger.audit("Master Data", "Delete", doc._id, user.id, `Room has been deleted by ${user.DisplayName}`);
        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot delete room, ${err.message}` }); }

});

module.exports = router;