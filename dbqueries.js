//requirespiced-pg
const spicedPg = require('spiced-pg');
//require secrets.json with paasword and user
const {dbUser, dbPass} = require('./secret.json');
//spiced pg database with passord and user
var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/images`);
const s3Url = require('./s3middleware').s3Url;

function getImages() {
    console.log('getImages is running');
    const q = `SELECT * FROM images`;
    return db.query(q)
        .then(results => {
            console.log('   db query getImages worked');
            //changing results.rows
            results.rows.forEach(function(result) {
                //s3 url + filename
                result.image = s3Url + result.image;
            })
            return results.rows;
        })
        .catch(err => {
            console.log('   getImages did not work', err)
        })
}

function storeFilenameInDb(title, description, username, image) {
    console.log('in storeFileNameInDb', title, description, username, image);
    const q = `INSERT INTO images (title, description, username, image) VALUES ($1, $2, $3, $4) RETURNING *`;
    const params = [title, description, username, image];
    return db.query(q, params)
        .then(function(results) {
            console.log('results.rows[0]: ', results.rows[0]);
            console.log('storeFilenameInDb is resolved');
            return results.rows[0];
        });
}

function getSingleImage(imageId) {
    console.log('getSingleImage is running');
    const q = `SELECT * FROM images WHERE id = $1`;
    const params = [imageId];
    return db.query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => {
            console.log('   getSingleImage query did not work', err);
        });

}

function postCommentinDb(comment, username, image_id) {
    console.log('in db query postCommentinDb');
    const q = `INSERT INTO comments (comment, username, image_id) VALUES ($1, $2, $3)`;
    const params = [comment, username, image_id];
    return db.query(q, params)
        .then(results => {
            console.log('   postCommentinDb worked, got back results.rows[0]: ', results.rows[0]);
            return results.rows[0];
        })
        .catch(err => {
            console.log('   postCommentinDb did not work');
        });
}

function getCommentsFromDb(image_id) {
    console.log('in db query getCommentsFromDb');
    const q = `SELECT * FROM comments WHERE image_id = $1`;
    const params = [image_id];
    return db.query(q,params)
        .then(results => {
            console.log('   success in getCommentsFromDb got results.rows[0]: ', results.rows);
            return results.rows;
        })
        .catch(err => {
            console.log('   error in getCommentsFromDb', err);
        })
}

exports.getImages = getImages;
exports.storeFilenameInDb = storeFilenameInDb;
exports.getSingleImage = getSingleImage;
exports.postCommentinDb = postCommentinDb;
exports.getCommentsFromDb = getCommentsFromDb;
