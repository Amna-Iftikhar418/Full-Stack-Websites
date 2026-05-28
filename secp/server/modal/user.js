const mongoose = require("mongoose")
const {Schema }= mongoose;
const passportlocalMongoose=require("passport-local-mongoose")
const userSchema =new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
})
userSchema.plugin(passportlocalMongoose)
const User= mongoose.model("User",userSchema)
module.exports=User;
