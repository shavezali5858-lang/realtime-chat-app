const express=require("express")
const router=express.Router()
const {signup,login,getme, logout,forgetpassword,Resetpassword}=require("../controllers/authcontroller")
const authmiddleware=require("../middlewares/authmiddleware")


router.post("/signup",signup)
router.post("/login",login)
router.get("/me",authmiddleware,getme)
router.post("/logout",logout)
router.post("/forget-password",forgetpassword)
router.post("/reset-password/:token",Resetpassword)

module.exports=router;

