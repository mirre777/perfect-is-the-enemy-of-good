const express = require('express');
const app = express();
var multer = require('multer');
var uidSafe = require('uid-safe');
var path = require('path');
var getImages = require('./dbqueries').getImages;
var storeFilenameInDb = require('./dbqueries').storeFilenameInDb;
var getSingleImage = require('./dbqueries').getSingleImage;
var postCommentinDb = require('./dbqueries').postCommentinDb;
var getCommentsFromDb = require('./dbqueries').getCommentsFromDb;
var uploadToS3 = require('./s3middleware').uploadToS3;
const s3Url = require('./s3middleware').s3Url;
var bodyParser = require('body-parser');


//MULTER
var diskStorage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});
//include the path + filename in the JSON response you send back to the browser.


//multer: combins all information about the file, and call next
var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 8097152
    }
});


//After the image has been uploaded, you can display it to the user if you have passed your /uploads directory to express.static
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(bodyParser.json());

app.listen(8080, function() {
    console.log('listening..');
});


//get one image
app.get('/images/:imageId', function(request, response) {
    console.log('in /images/:imageId');
    console.log('   request.params.imageId: ', request.params.imageId);
    return Promise.all([
        getSingleImage(request.params.imageId),
        getCommentsFromDb(request.params.imageId)
    ])
        .then(results => {
            console.log('results: ', results);
            results[0].image = s3Url + results[0].image;
            response.json({
                singleImageResults: results[0],
                comments: results[1]
            });
        })
        .catch(err => {
            console.log('   error in app.get /images/:imageId ', err);
        });
});


//get all images
app.get('/images', function(request, response) {
    console.log('in app.get /imageboard');
    getImages()
        .then(function(results) {
            console.log('   about to send allimages', results);
            response.json ({
                allimages: results
            })
        })
        .catch(err => {
            console.log('app.get /imageboard did not work', err);
        });
});


//The call to single indicates that we are only expecting one file. The string passed to single is the name of the field in the request (file).
//post the filename (that we get back from S3) to the server
app.post('/upload', uploader.single('file'), uploadToS3, function(request, response) {
    console.log('in app.post /images, request.file: ', request.file);
    storeFilenameInDb(request.body.title, request.body.description, request.body.username, request.file.filename)
        .then(stored => {
            console.log('   in .then of storeFileNameInDb of app.post /upload');
            console.log('   stored: ', stored);
            response.json({
                id: stored.id,
                image: s3Url + request.file.filename,
                title: stored.title,
                description: stored.description,
                username: stored.username,
                success: true
            });
        })
        .catch(failedtostore => {
            console.log('   app.post /upload, catch of storeFilenameInDb, failedtostore: ', failedtostore);
            response.sendStatus(500);
        });
});


//post comment
app.post('/comment', function(request, response) {
    console.log('in app.get /comment');
    const {comment, username, imageId} = request.body;
    postCommentinDb(comment, username, imageId)
        .then(results => {
            console.log('   comment posted successfully');
        })
        .catch(err => {
            console.log('   comment is not posted successfully');
        });
});
