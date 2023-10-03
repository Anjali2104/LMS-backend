import { Router } from "express";
import { buySubscription, 
    cancelSubscription, 
    getAllPayments, 
    getRazorpayApiKey, 
    verifySubscription } 
    from "../controllers/paymentController.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/authMiddleware.js";

const router = Router();

router
    .route('/razorpay-key')
    .get(
        isLoggedIn,
        getRazorpayApiKey
    );

router
    .route('/subscription')
    .post(
        isLoggedIn,
        buySubscription
    );

router
    .route('/verify')
    .post(
        isLoggedIn,
        verifySubscription
    );

router
    .route('/unsubscription')
    .post(
        isLoggedIn,
        cancelSubscription
    );

router
    .route('/')
    .get(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        getAllPayments
    );


export default router;