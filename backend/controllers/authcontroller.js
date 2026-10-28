const express=require("express")
const bcrypt=require("bcryptjs")
const User=require("../models/user")
const jwt=require("jsonwebtoken")
const crypto=require("crypto")
const transporter=require("../utils/mailer")

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;



const signup=async(req,res)=>{
    try{

        const {username,email,password}=req.body

        if(!username||!email||!password){
            return res.status(400).json({msg:"all fields are required"})
        }

        if(username.trim().length<4){
            return res.status(400).json({msg:"Username must be atleast 4 characters"})
        }
         const normalizedEmail = email.trim().toLowerCase();
          if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        msg: "Please enter a valid email address"
      });
    }
      if (!passwordRegex.test(password)) {
  return res.status(400).json({
    msg:
      "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
  });
}

        

        const existingUser = await User.findOne({
      email: normalizedEmail
    });

        if(existingUser){
            return res.status(400).json({msg:"Email already exists!!"})
        }


        const hashedpassword= await bcrypt.hash(password,10)
      


            const user=await User.create({
                username:username.trim(),
                email:email.trim().toLowerCase(),
                password:hashedpassword
            })

            return res.status(201).json({msg:"User created successfully"})
        
        }
        catch(error){

            return res.status(500).json({msg:"Signup error",error:error.message})

        }


    
}



const login=async(req,res)=>{
    try{
        const {email,password}=req.body

        if(!email||!password){
            return res.status(400).json({msg:"All fields are required"})
        }

        const Emailexists=await User.findOne({email:email.trim().toLowerCase()})

        if(!Emailexists){
            return res.status(404).json({msg:"Email does not exist!"})
        }

        const passwordValid= await bcrypt.compare(password,Emailexists.password)

        if(!passwordValid){
            return res.status(401).json({msg:"Password is wrong!"})
        }


const token=jwt.sign(
    {userId:Emailexists._id},
    process.env.JWT_SECRET,
    {expiresIn:"7d"}
)


res.cookie("token",token,{
    httpOnly:true,
    secure:false,
    samesite:"lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
})


        return res.status(200).json({msg:"Login successful"})


      
        
    }catch(error){
        return res.status(500).json({msg:"login failed!",error:error.message})
    }
}


const getme=async(req,res)=>{
    try{
        const user=await User.findById(req.user.userId).select("-password")

        if(!user){
            return res.status(404).json({msg:"No user found"})
        }


        return res.status(200).json({user})
    }catch(error){
        return res.status(500).json({msg:"failed to get user",error:error.message})
    }
}


const logout=async(req,res)=>{
    try{
   res.clearCookie("token",{
    httpOnly:true,
    secure:false,
    sameSite:"lax"
   })

   return res.status(200).json({msg:"logout successful"})
}catch(error){
    return res.status(500).json({msg:"logout failed",error:error.message})
}
}



const forgetpassword=async(req,res)=>{
    try{
        const {email}=req.body
const user=await User.findOne({email});

if(!user){
    return res.status(401).json({msg:"Invalid email or email does not exist"})
}


const token=crypto.randomBytes(32).toString("hex")

user.resetToken=token
user.resetTokenExpiry=Date.now()+15*60*1000

await user.save()


const resetURL =
  `${process.env.FRONTEND_URL}/reset-password/${token}`;

const response = await fetch(
  "https://api.brevo.com/v3/smtp/email",
  {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: user.email,
        },
      ],
      subject: "Reset your ChatApp password",
      htmlContent: `
        <h2>Reset your ChatApp password</h2>
        <p>Click below to reset your password.</p>
        <a href="${resetURL}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    }),
  }
);

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Brevo API error: ${errorText}`);
}






return res.status(201).json({msg:"reset token sent",token})
       
    }catch(error){
        return res.status(500).json({msg:"unable to generate reset token",error:error.message})
    }
}
const Resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        msg: "Password is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters",
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid or expired token",
      });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    user.password = hashedpassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return res.status(200).json({
      msg: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      msg: "Unable to reset password. Try again later.",
    });
  }
};







module.exports={signup,login,getme,logout,forgetpassword,Resetpassword}
