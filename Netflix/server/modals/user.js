const mongoose =require("mongoose")
const {Schema}=mongoose
const passportlocalMongoose=require("passport-local-mongoose")
const userSchema = new Schema({
    email:{
        type:String,
        required: true,
          unique: true
    },
})
userSchema.plugin(passportlocalMongoose, { usernameField: "email" });
// userSchema.plugin(passportLocalMongoose, { 
//   usernameField: "email",
//   usernameUnique: false  // prevent creating a duplicate index for "username"
// });
const User= mongoose.model("User",userSchema)
module.exports= User; 