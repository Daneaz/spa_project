var express = require('express');
var router = express.Router();
let createError = require('http-errors');
let jwt = require('jsonwebtoken');
var moment = require('moment');

var auth = require('../../services/auth');  
let logger = require('../../services/logger');

let Device = require('../../models/device');
let Room = require('../../models/room');
let Event = require('../../models/event');

/* POST register device. */
router.post('/reg', async (reqe, res, next) => {
    try{
        let rawDevice = reqe.body;

        if(!rawDevice.UID){ throw new Error('missing UID'); }
        if(!rawDevice.PairingCode){ throw new Error('missing PairingCode'); }

        //load device, if requested
        let newDevice = await Device.findOne({ "UID" : rawDevice.UID, "delFlag" : false});
        if(!newDevice){ //create device record, if never request before
            newDevice = new Device();
            newDevice.UID = rawDevice.UID;
        }

        newDevice.PairingCode = rawDevice.PairingCode;
        newDevice.Hardware = Object.assign({}, rawDevice.Hardware);
        newDevice.Software = Object.assign({}, rawDevice.Software);
        newDevice.Status = {
            RegIP : reqe.headers['x-forwarded-for'] || reqe.connection.remoteAddress
        }

        //****** TEST Code Start
        let sRoom = await Room.findOne({ "Name" : "Meeting Room 1", "delFlag" : false});
        newDevice.Room = sRoom._id;
        //****** TEST Code End

        let doc = await newDevice.save();
        let jwtObj = { uid: doc.UID, did: doc._id };
        let rsObj = {
            ok      : "Device has been registered, pending for pair with meeting room.", 
            token   : jwt.sign(jwtObj, process.env.DeviceSecret),
            id      : doc._id 
        };

        res.json(rsObj);

    }catch(err){ res.status(400).json({ error : `Cannot register device, ${err.message}` }) }

});


/* GET room details. */
router.get('/', async (reqe, res, next) => {
    try{
        let tokenStr = reqe.get('deviceToken');
        let jwtObj = jwt.verify(tokenStr, process.env.DeviceSecret);
        let sDevice = await Device.findById(jwtObj.did)
            .populate({ 
                path: 'Room', 
                select: 'Name Location Capacity Category',
                populate: { 
                    path: 'Category Features',
                    select: 'Name'
                } 
            });
        if(!sDevice){ throw new Error('Invalid device'); }

        //******** Test Code Start

        sDevice.Status.LastIP = reqe.headers['x-forwarded-for'] || reqe.connection.remoteAddress;
        sDevice.Status.LastCommAt = moment();

        sDevice.Events = [];
        sDevice.Events.push({
            Type    : 1,
            TypeName: "Meeting",
            Name    : "Test Meeting 1",
            Start   : moment.utc(0, "HH").add(17, "h").add(45, "m"),
            End     : moment.utc(0, "HH").add(18, "h").add(45, "m"),
            Desc    : "Test Meeting Desc\r\nTest Meeting Desc Line 2",
            NumAttendee : 4,
            Status  : "Confirmed",
            Organizer : { DisplayName : "David Wu", Email : "david@sharker.com.sg" }
        });
        sDevice.Events.push({
            Type    : 0,
            TypeName: "Blackout",
            Name    : "Aircon Servicing",
            Start   : moment.utc(0, "HH").add(19, "h").add(0, "m"),
            End     : moment.utc(0, "HH").add(20, "h").add(0, "m"),
        });
        sDevice.Events.push({
            Type    : 1,
            TypeName: "Meeting",
            Name    : "Test Meeting 2",
            VIP     : true,
            Start   : moment.utc(0, "HH").add(20, "h").add(0, "m"),
            End     : moment.utc(0, "HH").add(20, "h").add(30, "m"),
            Desc    : "Test Meeting Desc 2\r\n Line 2",
            NumAttendee : 2,
            Status  : "Confirmed",
            Organizer : { DisplayName : "Kevin Bai", Email : "kevin@sharker.com.sg" }
        });
        sDevice.Events.push({
            Type    : 1,
            TypeName: "Meeting",
            Name    : "Test Meeting 3",
            Start   : moment.utc(0, "HH").add(25, "h").add(0, "m"),
            End     : moment.utc(0, "HH").add(25, "h").add(45, "m"),
            Desc    : "Test Meeting Summary 3",
            NumAttendee : 3,
            Status  : "Confirmed",
            Organizer : { DisplayName : "Dong Lin", Email : "donglin@sharker.com.sg" }
        });

        //******** Test Code End

        jwtObj = { uid: sDevice.UID, did: sDevice._id, rid: sDevice.Room._id };
        let resObj = {
            Token   : jwt.sign(jwtObj, process.env.DeviceSecret),
            Room    : sDevice.Room,
            Events  : sDevice.Events
        };

        await sDevice.save();
        res.json(resObj);

    }catch(err){ next(createError(403)); return; }
});

module.exports = router;