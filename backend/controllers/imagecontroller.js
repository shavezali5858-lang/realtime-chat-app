const cloudinary=require("../cloudinary")
const multer=require("multer")

  const storage=multer.memoryStorage();

  const upload=multer({
    storage,
    limits:{
      fileSize:5*1024*1024
    },
    fileFilter:(req,file,cb)=>{
      if(file.mimetype.startsWith("image/")){
        cb(null,true)
      }else{
        cb(new Error("only image files are allowed"))
      }
    }
  })


const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      msg: "Please select an image",
    });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: "chatapp" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);

        return res.status(500).json({
          msg: "Image upload failed",
        });
      }

      return res.status(200).json({
        msg: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    }
  );

  stream.end(req.file.buffer);
};


module.exports={upload,uploadImage}
