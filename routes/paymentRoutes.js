import { Router } from "express";

const router = Router();

router
    .route('/razorpay-key')
    .get(getRazorpayApiKey);

router
    .route('/subscription')
    .post(buySubscription);

router
    .route('/verify')
    .post(verifySubscription);

router
    .route('/unsubscription')
    .post(cancelSubscription);

router
    .route('/')
    .get(getAllPayments);


export default router;