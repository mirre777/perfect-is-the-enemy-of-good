const knox = require('knox');
let secrets;
const fs = require('fs');
const s3Url = 'https://s3.amazonaws.com/spicedling/';


//middleware to upload fomr server to s3
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // secrets.json is in .gitignore
}


const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'spicedling'
});


function uploadToS3 (request, response, next) {
    //request
    const s3Request = client.put(request.file.filename, {
        'Content-Type': request.file.mimetype,
        'Content-Length': request.file.size,
        'x-amz-acl': 'public-read'
    });


    //create a read stream for the path
    //pipe the just read stream to the s3REQUEST
    const readStream = fs.createReadStream(request.file.path);
    readStream.pipe(s3Request);


    //The request object will emit an event when it is finished.
    //You can handle this event and check the status code of the response to determine if the put was successful.
    s3Request.on('response', s3Response => {
        console.log('s3request worked, in s3response');
        const wasSuccessful = s3Response.statusCode == 200;
        next();
        // response.json({
        //     success: wasSuccessful
        // });
    });
}

exports.uploadToS3 = uploadToS3;
exports.s3Url = s3Url;
