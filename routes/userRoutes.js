import  express from 'express';
import { register, login, logout, getProfile } from '../controllers/userController.js';
import { isLoggedIn } from '../middlewares/authMiddleware.js';



const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn, getProfile );


export default router;