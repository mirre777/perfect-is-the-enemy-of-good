//requirespiced-pg
const spicedPg = require('spiced-pg');
//require secrets.json with paasword and user
const {dbUser, dbPass} = require('./secrets.json');
//spiced pg database with passord and user
var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/images`);

function getImages() {
    console.log('getImages is running')
    const q = `SELECT * FROM images`;
    return db.query(q)
        .then(allimages => {
            console.log(' db query getImages worked');
            return allimages.rows;
        })
        .catch(err => {
            console.log('getImages did not work', err)
        })
}
//RES.JSON BACK TO AXIOS REQUEST

exports.getImages = getImages;
