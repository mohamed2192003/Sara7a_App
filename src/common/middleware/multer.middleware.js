import multer from "multer";
import fs from "fs"
export const multerLocal =({customePath} = {customePath: "general"})=>{
  let storage = multer.diskStorage({
    destination: function(req, file, cb){
      let filePath = `uploads/${customePath}`
      if(!fs.existsSync(filePath)){
        fs.mkdirSync(filePath, {recursive: true})
      }
      cb(null, filePath)
    },
    filename: function(req, file, cb){
      let prefix = Date.now()
      let fileName = `${prefix}-${file.originalname}`
      cb(null, fileName)
    }
  })  
  return multer({ storage})
}
export const upload = () => multer({ dest: 'uploads/' })
