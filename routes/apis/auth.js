var express = require('express');
var router = express.Router();
const path = require('path');
var fs = require('fs');
var auth = require('../../services/auth');
let Client = require('../../models/auth/client');
let Service = require('../../models/service');
let logger = require('../../services/logger');

/* POST login api. */
router.post('/login', async (reqe, res, next) => {

    var rsJson = { error: "invalid username or password" };
    try {
        //getting username & password from request body
        var username = reqe.body.username.toLowerCase();
        var password = reqe.body.password;

        if (username != null && username.length > 0 && password != null && password.length > 0) {

            //* get and check user account */
            let userObj = await auth.getUserByLogin(username, password);

            if (userObj != null) {

                var ip = reqe.headers['x-forwarded-for'] || reqe.connection.remoteAddress;

                //* JWT Auth */
                var userData = {
                    id: userObj._id,
                    username: userObj.username,
                    displayName: userObj.displayName,
                    role: {
                        id: userObj.role._id,
                        name: userObj.role.name
                    },
                    IP: ip
                }
                //console.log(userData);

                // issue JWT to cookie
                let token = auth.issueJwtCookie(userData, res);

                //clear up data
                delete userObj.role.createdAt;
                delete userObj.role.updatedAt;
                delete userObj.role.delFlag;
                delete userObj.role.__v;

                var rsJson = {
                    "ok": `Staff has logined from ${ip}`,
                    "token": token,
                    "user": userObj
                };
                logger.audit("Auth", "Login", userObj._id, userObj._id, `${userObj.displayName} has logined from ${ip}`);
            }
        }
    } catch (err) { }

    if (rsJson.error) { res.status(400) }

    res.json(rsJson);
});


router.get('/faciallogin/:id', async (reqe, res, next) => {

    var rsJson = { error: "invalid username or password" };
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

/* Save photo over Kiosk POST Create client . */
router.post('/savephoto', async (req, res, next) => {
    try {
        let dataObj = req.body;

        if (!dataObj.imagebase64) return res.sendStatus(400);
        // if (!dataObj.id) return res.sendStatus(400);

        var id = dataObj.id;
        var imageBase64s = dataObj.imagebase64.split(",");
        var fileType = "jpg";
        if (imageBase64s[0].includes("png")) { fileType = "png" }
        var imgData = imageBase64s[1];

        //console.log("imagebase64", imagebase64,firstname, lastname, filetype);

        var save_filename = path.resolve(__dirname, `../../client/public/photos/${id}.${fileType}`);

        fs.writeFile(save_filename, imgData, { encoding: 'base64' }, function (err) {
            if (err) throw err;
            console.log('File created');
        });

        res.json({ ok: 'success', path: save_filename });
    } catch (err) { res.status(400).json({ error: `Cannot save photo, ${err.message}` }) }

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
                    res.json({ ok: "Please process to the waiting area!" });
                }
            })
    } catch (err) { res.status(400).json({ error: `Cannot create client, ${err.message}` }) }

});


module.exports = router;