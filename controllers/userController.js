import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import fs from 'fs/promises';
import crypto from 'crypto';
import cloudinary from "cloudinary"
import sendEmail from "../utils/sendEmail.js";


const cookieOptions = {
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000 ,// 7 days
  httpOnly: true,
}

const register = async(req,res,next) => {
  // Destructuring the necessary data from req object
  const { fullName, email, password} = req.body;

   // Check if the data is there or not, if not throw error message
  if(!fullName || !email || !password){
    return next(new AppError('All fields are required', 400) );
  }
 
  // Finding the user with the sent email
  const userExists = await User.findOne({email});
  if(userExists){
    return next(new AppError('Email already exits', 400));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar:{
        public_id:email,
        secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
    },
  });

   // If user not created send message response
   if (!user) {
    return next(
      new AppError('User registration failed, please try again later', 400)
    );
  }
 
  // Run only if user sends a file
 if(req.file){
 // console.log(req.file)
  try {
    const result = await cloudinary.v2.uploader.upload( req.file.path,{
      resource_type:"image",
      folder:'lms',   // Save files in a folder named lms
      width:250,
      height:250,
      gravity:'faces',  // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
      crop:'fill',
    });
console.log(result)
    // If success
    if(result){
      // Set the public_id and secure_url in DB
      user.avatar.public_id = result.public_id;
      user.avatar.secure_url = result.secure_url;

      // After successful upload remove the file from local storage
      fs.rm(`uploads/${req.file.filename}`);

    }
  } catch (error) {
     return next(new AppError(error.message || 'File not uploaded , please try again', 500));
  }
 }

  await user.save();

  // Generating a JWT token
  const token = await user.generateJWTToken();
    
  // Setting the password to undefined so it does not get sent in the response
  user.password = undefined;

  // Setting the token in the cookie with name token along with cookieOptions
  res.cookie('token', token, cookieOptions);

  // If all good send the response to the frontend
  res.status(200).json({
    success:true,
    message:"User registered successfully",
    user,
  })

}

const login = async (req,res,next) => {

    // Destructuring the necessary data from req object
    const { email, password} = req.body;

     // Check if the data is there or not, if not throw error message
    console.log(email, password);
    if( !email || !password){
      return next(new AppError('All fields are required', 400) );
    }
    
    // Finding the user with the sent email
    const user = await User.findOne({email}).select('+password');

    // If no user or sent password do not match then send generic response
    if(!(user || (await user. comparePassword(password)) )){
        return next(new AppError('Email or password do not match', 400));
    }
    
    // Generating a JWT token
    const token =  await user.generateJWTToken();
    console.log(token);

    // Setting the password to undefined so it does not get sent in the response
    user.password = undefined;

    // Setting the token in the cookie with name token along with cookieOptions
    
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success:true,
      message:'User loggedIn successfully',
      user
    })
}


const logout = (req,res) => {
  res.cookie('token', null, {
    secure:true,
    maxAge:0,
    httpOnly:true,
  });

  res.status(200).json({
    success:true,
    message:"User logged out successfully",
  })
}

const getProfile =  async (req,res) => {
   const user =  await User.findById(req.user.id);

   res.status(200).json({
    success:true,
    message:"User details",
    user
   })

}

const forgotPassword = async(req,res,next) => {
   const { email } = req.body;

   if(!email){
    return next(
      new AppError('Email is required', 400)
    )
   }

   const user = await User.findOne({email});
   if(!user){
    return next(
      new AppError('Email not registered', 400)
    )
   }

   const resetToken = await user.generatePasswordToken();

   await user.save();

   const resetPasswordUrl = `${process.env.FRONTED_URL}/reset-password/${resetToken}`;
   const subject = 'Reset Password';
   const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

   try {
    // TODO: create sendEmail
    await sendEmail(email, subject, message);

    res.status(200).json({
      success:true,
      message: `Reset password token has been sent to ${email} successfully`
    })

   } catch (e) {
     user.forgotPasswordExpiry = undefined;
     user.forgotPasswordToken = undefined;
     await user.save();
     return next(new AppError(e.message, 500));
   }
}

const resetPassword = async(req,res,next) => {
   const {resetToken} = req.params;
   const {password} = req.body;

   const forgotPasswordToken = crypto
       .createHash('sha256')
       .update(resetToken)
       .digest('hex');
    
    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry : { $gt: Date.now()}
    });

    if(!user){
      return next(
        new AppError('Token is invalid or expired, please try again', 400)
      )
    }

    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();

    res.status(200).json({
      success:true,
      message:'Password changed successfully',
    })
}

const changePassword = async(req,res,next) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;

  if(!oldPassword || newPassword){
    return next(
      new AppError('All fields are mandatory', 400)
    )
  }

  const user = await User.findById(id).select('+password');

  if(!user){
    return next(
      new AppError('User does not exist', 400)
    )
  }

  const isPasswordValid = await user.comparePassword(password);

  if(!isPasswordValid){
    return next(
      new AppError('Inavlid old password', 400)
    )
  }

  user.password = newPassword;

  await user.save();

  user.password = undefined;

  res.status(200).json({
    success:true,
    message:'Password changed successfully!'
  })
}

const updateUser = async(req,res,next) => {
  const { fullName } = req.body;
  const { id } = req.user;

  const user = await User.findById(id);

  if(!user){
    return next(
      new AppError('User does not exit', 400)
    )
  }

  if(fullName){
    user.fullName = fullName;
  }

  if(req.file){
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms', // Save files in a folder named lms
        width: 250,
        height: 250,
        gravity: 'faces', // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
        crop: 'fill',
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new AppError(error || 'File not uploaded, please try again', 400)
      );
    }
  
    await user.save();

    res.status(200).json({
      success:true,
      message:'User details updated successfully!'
    })

  }
}
export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}