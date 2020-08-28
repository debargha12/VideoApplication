var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('../models/account');

var monk = require('monk');
var db = monk('localhost:27017/vidzy');


router.get('/', function (req, res) {

  var titleID = typeof req.query.sb !== 'undefined'?req.query.sb:".*";
  var genreID = typeof req.query.gn !== 'undefined'?req.query.gn:".*";
  
    var collection = db.get('videos');
    collection.find({"title":{$regex:titleID, $options: 'i'},"genre":{$regex:genreID, $options: 'i'}},
      {}, function(err, videos){
        if (err) throw err;
        res.render('index', { videos: videos, user : req.user, titleID: req.query.titleID, genreID: req.query.genreID});
      });
});



//#User Signup, login, logout

  router.get('/register', function(req, res) {
      res.render('register', { });
  });

//insert a new user
  router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
          session = req.session;
          session.user = req.user;
          res.redirect('/');
        });
    });
  });

  router.get('/login', function(req, res) {
      session = req.session;
      session.user = req.user;
      res.render('login', { user : req.user });
  });

  router.post('/login', passport.authenticate('local'), function(req, res) {
      res.redirect('/');
  });

  router.get('/logout', function(req, res) {
      req.session.destroy();
      req.logout();

      res.redirect('/');
  });

  




//####################################

// router.get('/', function(req, res) {
//   res.redirect('/videos');
// });


router.get('/videos', function(req, res) {
    var collection = db.get('videos');
    collection.find({}, function(err, videos){
        if (err) throw err;
  		res.render('index', { videos: videos });
    });
});



router.get('/videos/new', function(req, res) {

	res.render('new');
});


router.get('/videos/:id', function(req, res) {
    var collection = db.get('videos');
    collection.findOne({_id: req.params.id}, function(err, video){
        if (err) throw err;
  		res.render('show', { video: video, user: req.user });
    });
});


router.get('/videos/:id/edit', function(req, res) {
    var collection = db.get('videos');
    collection.findOne({_id: req.params.id}, function(err, video){
        if (err) throw err;
        // res.render('edit');
        res.render('edit', { video: video });
    });
});



router.post('/videos', function(req, res) {
    var collection = db.get('videos');
    collection.insert({
    	title: req.body.title,
    	genre: req.body.genre,
    	image: req.body.image,
    	description: req.body.description

    	}, function(err, videos){
        if (err) throw err;
  		res.redirect('/videos');
    });
});

//Update Route
router.put('/videos/:id', function(req, res) {
    var collection = db.get('videos');
    collection.findOneAndUpdate({_id: req.params.id}, { $set: { title: req.body.title,
                                                                genre: req.body.genre,
                                                                image: req.body.image,
                                                                description: req.body.description} 
                                                      }).then((updatedDoc) => {})
    res.redirect('/');
});

//Delete Route

router.delete('/videos/:id', function(req, res){
    var collection = db.get('videos');
    collection.remove({ _id: req.params.id }, function(err, video){
        if (err) throw err;

        res.json(video);
    });
});


// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
