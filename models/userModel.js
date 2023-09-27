const {Schema,model} = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
    fullName:{
        type:String,
        required:[true,"Name is required"],
        minLength:[3,"Name must be at least 3 characters"],
        maxLength:[50, "Name should be less than 50 characters"],
        lowercase:true,
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true,
        trim:true,
        match:[ /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please fill in a valid email address',]
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[8,"Password must be at least 8 characters"],
        select:false,   
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    },
    avatar:{
       public_id:{
         type:String
       },
       secure_url:{
        type:String
       },
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date,
},{
    timestamps:true
})

userSchema.pre('save',  async function(){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
    comparePassword: async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword, this.password);
    },
    generateJWTToken : function(){
        return jwt.sign(
            { id: this._id, role: this.role, email: this.email, subscription: this.subscription},
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        )
    }
}

const User = model('User', userSchema);
module.exports = User;