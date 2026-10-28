const mongoose=require("mongoose")

const messageSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    room:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:false,
        default:" "
    },
    time:{
        type:Date,
        default:Date.now
    },
    imageUrl:{
        type:String,
        default:""
    }
})


const message=mongoose.model('message',messageSchema)


module.exports=message