import  express from 'express';
import { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword } from '../controllers/userController.js';
import { isLoggedIn } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multerMiddleware.js';



const router = express.Router();
router.post('/register', upload.single('avatar') , register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn, getProfile );
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);


export default router;