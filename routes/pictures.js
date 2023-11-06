var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');


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
router.get('/', function(req, res, next) {
  const pictures = fs.readdirSync(path.join(__dirname, '../pictures/'));
  res.render('pictures', { pictures: pictures});
});

router.post('/', function(req, res, next) {
  const file = req.files.file;
  fs.writeFileSync(path.join(__dirname, '../pictures/', file.name), file.data);
  res.end();
});

module.exports = router;