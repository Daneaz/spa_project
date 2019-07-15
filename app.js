var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cronJob = require('cron').CronJob;

let auth = require('./services/auth');
let logger = require('./services/logger');

var indexRouter = require('./routes/index');
var apiAuthRouter = require('./routes/apis/auth');
var apiUserMgtRouter = require('./routes/apis/userMgt');
var apiClientMgtRouter = require('./routes/apis/clientMgt');

var deviceRouter = require('./routes/apis/device');

var apiMasterDataRouter = require('./routes/apis/masterData');
var roomRouter = require('./routes/apis/room');

var app = express();

//setup express
app.disable('x-powered-by');
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: false }));
app.use(express.static(path.join(__dirname, 'client/build')));

// setup mongoose
mongoose.connect(process.env.MongoDB_ConnectionString, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//load app version
var pjson = require('./package.json');
app.locals.ver = pjson.version;

//routing
app.use('/api', indexRouter);
app.use(`/api/auth`, apiAuthRouter);
app.use(`/api/device`, deviceRouter);
// check jwt if invalid
app.use(auth.checkJwt);
app.use('/api/userMgt', apiUserMgtRouter);
app.use('/api/clientMgt', apiClientMgtRouter);
app.use('/api/masterData', apiMasterDataRouter);
app.use('/api/rooms', roomRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {

  let errObj = {
    error: err.message,
    code: err.status || 500,
    details: err.stack,
  }
  //log user info if logined
  if (res.locals.user) { errObj.user = res.locals.user }

  //log error/info
  if (errObj.code === 500) { logger.error(errObj) }

  //send back error
  res.status(errObj.code);
  //only providing error in development
  if (req.app.get('env') !== 'development' || errObj.code !== 500) { delete errObj.details }
  delete errObj.user;
  res.json(errObj);
});

module.exports = app;
