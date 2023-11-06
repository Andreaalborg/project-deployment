var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');
const AWS = require("aws-sdk");
const s3 = new AWS.S3()


router.get('/:pictureName', function(req, res, next) {
  var pictureName = req.params.pictureName;
  var picturePath = path.join(__dirname, '..', 'pictures', pictureName);

  fs.access(picturePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Filen finnes ikke
      return res.status(404).send('Bildet ble ikke funnet');
    }
    // Filen finnes, send den tilbake som et svar
    res.sendFile(picturePath);
  });
});
// Or
/* GET pictures listing. */
router.get('/', async function(req, res, next) {
  try {
    var params = {
      Bucket: process.env.CYCLIC_BUCKET_NAME,
      Delimiter: '/',
      Prefix: 'public/'
    };
    var allObjects = await s3.listObjects(params).promise();
    var keys = allObjects?.Contents.map(x => x.Key);

    const pictures = await Promise.all(keys.map(async (key) => {
      let my_file = await s3.getObject({
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: key,
      }).promise();
      return {
        src: `data:image/jpeg;base64,${Buffer.from(my_file.Body).toString('base64')}`,
        name: key.split("/").pop()
      };
    }));

    // Send pictures to the view
    res.render('pictures', { pictures: pictures });
  } catch (error) {
    // Handle errors here
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

router.post('/', async function(req, res, next) {
  const file = req.files.file;
  console.log(req.files);
  await s3.putObject({
    Body: file.data,
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Key: "public/" + file.name,
  }).promise()
  res.end();
});
module.exports = router;