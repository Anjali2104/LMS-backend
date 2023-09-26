const  express = require('express');
const { register, login, logout, getProfile } = require('../controllers/userController');


const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', getProfile );

module.exports = router;