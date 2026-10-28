const mongoose=require("mongoose")


const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:3

    },

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minlength:8

    },

    resetToken:{
        type:String
    },

    resetTokenExpiry:{
        type:Date
    }
},
    {timestamps:true}

)

const User=mongoose.model("User",UserSchema)

module.exports=User






