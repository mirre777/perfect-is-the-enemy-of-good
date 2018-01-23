const express = require('express');
const app = express();
var multer = require('multer');
var uidSafe = require('uid-safe');
var path = require('path');
var getImages = require('./dbqueries.js').getImages;

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});
//multer: combins all information about the file, and call next
var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});


app.use(express.static('public'));
app.use(express.static('uploads'));

app.listen(8080, function() {
    console.log('listening..');
});


app.get('/imageboard', function(request, response) {
    console.log('in app.get /imageboard');
    getImages()
        .then(function(results) {
            console.log('about to send allimages', results);
            response.json ({
                allimages: results
            })
        })
        .catch(err => {
            console.log('app.get /imageboard did not work', err);
        });
});


//The call to single indicates that we are only expecting one file. The string passed to single is the name of the field in the request.
app.post('/images', uploader.single('file'), function(request, response) {
    console.log('in app.post /images');
    if (request.file) {
        response.json({
            success: true
        });
    }
    else {
        response.json({
            success: false
        });
    }
});
