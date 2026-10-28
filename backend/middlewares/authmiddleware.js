const jwt=require("jsonwebtoken")

const authmiddleware=(req,res,next)=>{
    try{
        //GET
        const token=req.cookies.token
        if(!token){
            return res.status(401).json({msg:"not authenticated!"})
        }
//VERIFY
        const decoded=jwt.verify(
            token,
            process.env.JWT_SECRET
        )
//ATTACH
        req.user=decoded
        //NEXT
        next()




    }catch(error){
        return res.status(401).json({msg:"invalid or expired token!"})
    }
}


module.exports=authmiddleware