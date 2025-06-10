const express = require('express');
const meeting = require('./meeting');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.post('/add', auth, meeting.add);
router.post('/update/:id', auth, meeting.update);
router.get('/', auth, meeting.index);
router.get('/view/:id', auth, meeting.view);
router.delete('/delete/:id', auth, meeting.deleteData);
router.post('/deleteMany', auth, meeting.deleteMany);

module.exports = router;