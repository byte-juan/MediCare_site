import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

//configuracion cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});

//subir archivos a cloudinary
export async function uploadToCloudinary(filePath, folder = "Doctor") {
    try{
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: "image"
        });
        //eliminar el archivo local despues subirlo 
        fs.unlinkSync(filePath);
        return result;
    }
    catch (err) {
        console.error("Cloudinary upload error:", err);
        throw err;
    }
}

// para eliminar la imagen de cloudinary si el usuario lo remueve de la IU
export async function deleteFromCloudinary(publicId){
    try{
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    }
    catch(err) {
        console.error("Cloudinary delete error:", err);
        throw err;
    }
}
export default cloudinary;