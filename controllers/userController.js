import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
const cookieOptions = {
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000 ,// 7 days
  httpOnly: true,
}

const register = async(req,res,next) => {
  const { fullName, email, password} = req.body;

  if(!fullName || !email || !password){
    return next(new AppError('All fields are required', 400) );
  }

  const userExists = await User.findOne({email});
  if(userExists){
    return next(new AppError('Email already exits', 400));
  }

  const user = User.create({
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
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path ,{
      folder:lms,   // Save files in a folder named lms
      width:250,
      height:250,
      gravity:'faces',  // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
      crop:'fill',
    });

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
  const token = user.generateJWTToken();
    
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
    if( !email || !password){
      return next(new AppError('All fields are required', 400) );
    }
    
    // Finding the user with the sent email
    const user = User.findOne({email}).select('+password');

    // If no user or sent password do not match then send generic response
    if(!user || !user.comparePassword(password)){
        return next(new AppError('Email or password do not match', 400));
    }
    
    // Generating a JWT token
    const token = user.generateJWTToken();

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

export {
    register,
    login,
    logout,
    getProfile,
}