const User = require("../models/userModel");
const { default: AppError } = require("../utils/appError");

const cookieOptions = {
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000 ,// 7 days
  httpOnly: true,
}

const register = async(req,res) => {
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
   
  //TODO: upload user picture
  await user.save();

  // TODO: set JWT token in cookie

  user.password = '';
  res.status(200).json({
    success:true,
    message:"User registered successfully",
    user,
  })

}

const login = async (req,res) => {
    const { email, password} = req.body;

    if( !email || !password){
      return next(new AppError('All fields are required', 400) );
    }
    
    const user = User.findOne({email}).select('+password');

    if(!user || !user.comparePassword(password)){
        return next(new AppError('Email or password do not match', 400));
    }

    const token = user.generateJWTToken();
    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success:true,
      message:'User loggedIn successfully',
      user
    })
}


const logout = (req,res) => {

}

const getProfile = (req,res) => {

}

module.exports = {
    register,
    login,
    logout,
    getProfile,
}