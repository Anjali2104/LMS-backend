import Payment from "../models/paymentModel";
import User from "../models/userModel,js";
import { razorpay } from "../server";
import AppError from "../utils/appError.js"
import crypto from 'crypto';

export const getRazorpayApiKey = async(req, res, next) => {
  try {

    res.status(200).json({
        success:true,
        message:'Razorpay API Key!',
        key: process.env.RAZORPAY_KEY_ID,
    })
    
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
}

export const buySubscription = async(req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById({id});

      if(!user){
        return next(
            new AppError('Unauthorized, please login!', 500)
        )
      }

      if(user.role === 'ADMIN'){
        return next(
            new AppError('ADMIN cannot purchase subscription', 400)
        )
      }
      
      const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify:1
      })

      //update user model with subscription
      user.subscription.id = subscription.id;
      user.subscription.status = subscription.status;

      await user.save();

      res.status(200).json({
        success:true,
        message:'Subscribed successfully',
      })


    } catch (error) {
      return next(new AppError(error.message, 500));
    }
}

export const verifySubscription = async(req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById({id});
  
        if(!user){
          return next(
              new AppError('Unauthorized, please login!', 500)
          )
        }
        
        const { razorpay_payment_id , razorpay_signature, razorpay_subscription_id } = req.body;

        const generatedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_SECRET)
          .update(`${razorpay_payment_id} | ${razorpay_subscription_id}`)
        
        if( generatedSignature !== razorpay_signature){
            return next(
                new AppError('Payment not verified, please try again', 500)
            )
        }

        // record payment details in payment collection
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

        // update user record with subscription status
        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success:true,
            message:'Payment verified successfully!'
        })

    } catch (error) {
      return next(new AppError(error.message, 500));
    }
}

export const cancelSubscription = async(req, res, next) => {
    try {
    
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
}

export const getAllPayments = async(req, res, next) => {
    try {
    
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
}

