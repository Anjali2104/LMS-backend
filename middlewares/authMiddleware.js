import AppError from "../utils/appError.js";
import jwt from 'jsonwebtoken'

const isLoggedIn = async function(req, res, next){
  const { token } = req.cookies;
  if(!token){
    return next(new AppError("Unauthenticated , please login", 401));
  }

  const tokenDetails = await jwt.verify(token, process.env.JWT_SECRET);
  if(!tokenDetails){
    return next(new AppError("Unauthenticated , please login", 401));
  }
  
  req.user = tokenDetails;
  next();
}

const authorizedRoles = (...roles) => async(req,res,next) =>{
  const currentRole = req.user.role;
  if(! roles.includes(currentRole)){
    return next(
      new AppError('You do not have permission to access this route', 403)
    )
  }
  next();
}

const authorizedSubscriber = async(req, res, next) => {
  const subscriptionStatus = req.user.subscription.status;
  const currentRole = req.user.role;

  if(currentRole !== 'ADMIN' && subscriptionStatus !== 'active'){
    return next(
      new AppError('Please subscribe to access this course!', 403)
    )
  }
  next();
}
export {
    isLoggedIn,
    authorizedRoles,
    authorizedSubscriber
}