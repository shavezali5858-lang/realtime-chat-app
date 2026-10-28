const mongoose=require("mongoose")

const PrivatemsgSchema=new mongoose.Schema({

      from: {
            type: String,
            required: true,
            trim: true
        },
        to: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: false,
            trim: true,
            default:" "
        },
        imageUrl:{
            type:String,
            default:" "
        }

},
{timestamps:true}
)

const Privatemessage=mongoose.model("Privatemessage",PrivatemsgSchema)

module.exports=Privatemessage