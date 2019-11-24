var express = require('express');
var router = express.Router();
var auth = require('../../services/auth');
let Appointment = require('../../models/appointment')
let Category = require('../../models/category')
let Client = require('../../models/auth/client');
let Service = require('../../models/service');
let Booking = require('../../models/booking');
let logger = require('../../services/logger');
const path = require('path');
var fs = require('fs');

// Azure storage config
const storage = require('azure-storage');
const accountName = 'projectspa';
const accountKey = 'R7zA1Mtsis7edYRfOEwu8Sv4gmA51Cz3bx13N5GH83ixS/XI/IPr/yO0Ku8btTp6tvYghS6rzPEFMGJfFoUYjg==';
const containerName = 'spacontainer';
const blobService = storage.createBlobService(accountName, accountKey);

// SMS Config
const messagingApi = require("@cmdotcom/text-sdk");
const yourProductToken = "91888406-8B79-4800-9DB9-02390203CDA7";
const myMessageApi = new messagingApi.MessageApiClient(yourProductToken);

router.get('/faciallogin/:id', async (reqe, res, next) => {

    var rsJson = { error: "invalid mobile" };
    try {
        let userObj = await Client.findOne({ "_id": reqe.params.id, "delFlag": false }).lean()
            .select({
                "email": 1,
                "mobile": 1,
                "displayName": 1,
                "nric": 1,
                "gender": 1,
                "credit": 1,
            });

        if (userObj != null) {

            var ip = reqe.headers['x-forwarded-for'] || reqe.connection.remoteAddress;

            //* JWT Auth */
            var userData = {
                id: userObj._id,
                displayName: userObj.displayName,
                IP: ip
            }
            //console.log(userData);

            // issue JWT to cookie
            let token = auth.issueJwtCookie(userData, res);

            var rsJson = {
                "ok": `Client has logined from ${ip}`,
                "token": token,
                "user": userObj
            };
            logger.audit("Auth", "Facial Login", userObj._id, userObj._id, `${userObj.displayName} has logined from ${ip}`);
        }

    } catch (err) { }

    if (rsJson.error) { res.status(400) }

    res.json(rsJson);
});

router.get('/mobilelogin/:mobile', async (reqe, res, next) => {

    var rsJson = { error: "invalid mobile" };
    try {
        let userObj = await Client.findOne({ "mobile": reqe.params.mobile, "delFlag": false }).lean()
            .select({
                "email": 1,
                "mobile": 1,
                "displayName": 1,
                "nric": 1,
                "gender": 1,
                "credit": 1,
            });

        if (userObj != null) {

            var ip = reqe.headers['x-forwarded-for'] || reqe.connection.remoteAddress;

            //* JWT Auth */
            var userData = {
                id: userObj._id,
                displayName: userObj.displayName,
                IP: ip
            }
            //console.log(userData);

            // issue JWT to cookie
            let token = auth.issueJwtCookie(userData, res);

            var rsJson = {
                "ok": `Client has logined from ${ip}`,
                "token": token,
                "user": userObj
            };
            logger.audit("Auth", "Facial Login", userObj._id, userObj._id, `${userObj.displayName} has logined from ${ip}`);
        }

    } catch (err) { }

    if (rsJson.error) { res.status(400) }

    res.json(rsJson);
});

/* Register client over Kiosk POST Create client . */
router.post('/clients', async (reqe, res, next) => {
    try {

        let rawNewClient = reqe.body;

        let sClient = await Client.findOne({ "mobile": rawNewClient.mobile }).lean().select({ "mobile": 1 });
        if (sClient != null) { throw new Error('login name is already taken.') }

        //load main fields
        let newClient = new Client(rawNewClient);

        //load fields by biz logic
        newClient.password = auth.hash(rawNewClient.password);

        //save client 
        let user = await newClient.save();
        let rsObj = { ok: "Client has been created.", user: user };
        logger.audit("Client Mgt", "Create", user._id, `A new client has self registor`);
        res.json(rsObj);

    } catch (err) { res.status(400).json({ error: `Cannot create client, ${err.message}` }) }

});

/* GET service list. */
router.get('/services', async (reqe, res, next) => {
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

/* GET available staff list. */
router.post('/availablestaff', async (reqe, res, next) => {
    try {
        //get raw data from data
        let service = reqe.body;
        let startTime = new Date(service.start)
        let endTime = new Date(service.end)
        let staffs = service.staff;
        let staffList = []
        let todayDate = new Date(startTime.toDateString());
        for (let i = 0; i < staffs.length; i++) {
            let bookings = await Booking.find({ staff: staffs[i]._id, start: { $gte: todayDate }, delFlag: false });
            if (bookings.length <= 0) {
                staffList.push(staffs[i])
                continue;
            }
            let conflit = false;
            for (let j = 0; j < bookings.length; j++) {
                if ((bookings[j].end > startTime && startTime > bookings[j].start) || (bookings[j].end > endTime && endTime > bookings[j].start)) {
                    conflit = true
                }
            }
            if (!conflit) {
                staffList.push(staffs[i])
            }
        }
        res.send(staffList);
    } catch (err) { res.status(400).json({ error: `Cannot get availablestaff, ${err.message}` }) }
});

/* Register client over Kiosk POST Create client . */
router.post('/buyservice', async (reqe, res, next) => {
    try {

        let data = reqe.body;

        Client.findOne({ "_id": data.id, "delFlag": false })
            .then(client => {
                if (client.credit < data.price) {
                    res.json({ error: "Not enought credit, Please top up!" });
                } else {
                    client.credit = client.credit - data.price;
                    client.save();
                    let mobile = client.mobile;
                    let firstDigit = mobile.toString()[0];
                    if (mobile.toString().length === 8 && (firstDigit === '8' || firstDigit === '9')) {
                        mobile = `+65${mobile}`;
                    }
                    let message = `You have purchase a service recently. Your remaining credit is ${client.credit}`
                    const result = myMessageApi.sendTextMessage([mobile], "Sante", message);
                    result.then((result) => {
                        console.log(result);
                    }).catch((error) => {
                        console.log(error);
                    });
                    res.json({ ok: "Please process to the waiting area!" });
                }
            })
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: `Cannot create client, ${err.message}` })
    }

});
/* POST Create appointment. */
router.post('/appointment', async (reqe, res, next) => {
    try {
        //Create an empty appointment to get the id.

        (new Appointment({ client: reqe.body[0].client })).save().then(async (appointment) => {
            let bookings = reqe.body
            for (let i = 0; i < bookings.length; i++) {
                let client = await Client.findById(bookings[i].client)
                let service = await Service.findById(bookings[i].service)
                bookings[i].appointment = appointment._id
                bookings[i].title = `${service.name} ${client.displayName}`
                bookings[i].createdBy = "Kiosk";
            }

            // creating all bookings
            Booking.insertMany(bookings).then(bookings => {
                let bookingids = bookings.map(booking => {
                    return booking._id
                })
                appointment.bookings = bookingids

                appointment.save()
                let rsObj = { ok: "Appointment has been created.", bookings: bookings, appointmentId: appointment._id }
                res.json(rsObj)
            }).catch(err => {
                res.status(400).json({ error: `Cannot create appointment, ${err.message}` })
            })
        }).catch(err => {
            res.status(400).json({ error: `Cannot create appointment, ${err.message}` })
        })
    } catch (err) {
        res.status(400).json({ error: `Cannot create appointment, ${err.message}` })
    }
});

/* Save photo over Kiosk POST Create client . */
router.post('/savephoto', async (req, res, next) => {
    try {
        let dataObj = req.body;

        if (!dataObj.imagebase64) return res.sendStatus(400);

        var id = dataObj.id;
        var imageBase64s = dataObj.imagebase64.split(",");
        var fileType = "jpg";
        if (imageBase64s[0].includes("png")) { fileType = "png" }
        var imgData = imageBase64s[1];

        var buffer = Buffer.from(imgData, 'base64');
        var blobName = `${id}.${fileType}`

        uploadFromURL(containerName, blobName, buffer).then(response => {
            console.log(response.message);
            console.log(`Blobs in "${containerName}" container:`);
            res.json({ ok: 'success' });
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: `Cannot save photo, ${err.message}` })
    }

});

/* Get Category. */
router.get('/category', async (reqe, res, next) => {
    try {
        let category = await Category.aggregate([
            { $match: { delFlag: false } },
            {
                $project: {
                    "value": "$_id",
                    "label": "$name",
                }
            }
        ])
        res.send(category);
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ error: `Cannot get category, ${err.message}` })
    }
});

const uploadLocalFile = async (containerName, filePath) => {
    return new Promise((resolve, reject) => {
        const fullPath = path.resolve(filePath);
        const blobName = path.basename(filePath);
        blobService.createBlockBlobFromLocalFile(containerName, blobName, fullPath, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Local file "${filePath}" is uploaded` });
            }
        });
    });
};

const uploadFromURL = async (containerName, blobName, stream) => {
    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromText(containerName, blobName, stream, { contentType: "image/jpeg" }, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `File "${blobName}" is uploaded` });
            }
        });
    });
};

const listBlobs = async (containerName) => {
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmented(containerName, null, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
            }
        });
    });
};

const deleteBlob = async (containerName, blobName) => {
    return new Promise((resolve, reject) => {
        blobService.deleteBlobIfExists(containerName, blobName, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Block blob '${blobName}' deleted` });
            }
        });
    });
};

const execute = async () => {

    console.log(`Blobs in "${containerName}" container:`);
    response = await listBlobs(containerName);
    response.blobs.forEach((blob) => console.log(` - ${blob.name}`));
    // var blobName = "5d7fc9803801852e78e6d194.jpg"
    // await deleteBlob(containerName, blobName);
    // console.log(`Blob "${blobName}" is deleted`);
}
execute().then(() => console.log("Done")).catch((e) => console.log(e));

module.exports = router;