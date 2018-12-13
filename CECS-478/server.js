// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var bcrypt = require('bcryptjs');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;        // set our port
var morgan      = require('morgan');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Database'); // connect to our database
var Message     = require('./app/models/message');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our  mongoose model

app.set('superSecret', config.secret);
app.use(morgan('dev'));

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});
/*Used for testing
// more routes for our API will happen here
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});
*/
/*
router.route('/users')
	// get all the users (accessed at GET http://localhost:8080/api/users)
    .get(function(req, res) {
        User.find({}, function(err, users) {
		res.json(users);
    })

    router.route('/users/:user_id')

    // get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    })

    .delete(function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    })

});   
*/
// Setup
app.post('/setup', function(req, res) {
var hash = bcrypt.hashSync(req.body.password, 10);
  // create a sample user
  var account = new User({ 
    name: req.body.name, 
    password: hash,
    admin: false 
  });
  
  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
        // save the sample user
		  account.save(function(err) {
			if (err) throw err;

			console.log('User saved successfully');
			res.json({ success: true });
		  });
      } else {
		console.log('User already exists');
		res.json({ success: false });
      } 
  });
});


// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token with only our given payload
    // we don't want to pass in the entire user since that has the password
    const payload = {
      name: user.name};
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 60*60*24 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      } 
    }

  });
});

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {       if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });       } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;         next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});


// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// Message API
router.route('/message')
    // create a message (accessed at POST http://localhost:8080/api/message)
    .post(function(req, res) {

var token = req.body.token || req.query.token || req.headers['x-access-token'];
var decoded = jwt.decode(token, app.get('superSecret'));
var UserName = decoded.name;
        var message = new Message();      // create a new instance of the Message model
        message.sender = UserName,  // set the message name (comes from the request)
		message.receiver = req.body.receiver,
		message.text = req.body.text,
                message.RSACipher = req.body.RSACipher,
                message.tag = req.body.tag,
                message.IV = req.body.IV
        if(!req.body.receiver) res.status(400).send("Receiver no input")
        // save the message and check for errors
else{
        message.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Message created!' });
        });
}
    })

    // get the message with that id (accessed at GET http://localhost:8080/api/message/
    .get(function(req, res) {
var token = req.body.token || req.query.token || req.headers['x-access-token'];
var decoded = jwt.decode(token, app.get('superSecret'));
var UserName = decoded.name;

        Message.find({receiver: UserName}, function(err, message) {
            if (err)
                res.send(err);
            res.json(message);

            Message.remove({receiver: UserName}, function(err, message) {
            if (err)
                res.send(err);
            });
        });
    })
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
