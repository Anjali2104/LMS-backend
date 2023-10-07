import AppError from "../utils/appError.js"
import sendEmail from "../utils/sendEmail.js";

export const contactUs = async(req,res,next) => {
    const { name, email, message} = req.body;
    if(!name || !email || !message){
        return next(
            new AppError('All fields are required', 400)
        )
    };
    
    try {
        
        const subject = 'Contact Us form';
        const textMessage = `${name} - ${email} <br /> ${message}`;

         // Await the send email
        await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);   
    } catch (error) {
        console.log(error);
        return next(new AppError(error.message, 400));
    }

    res.status(200).json({
        success: true,
        message: 'Your request has been submitted successfully',
    });
}