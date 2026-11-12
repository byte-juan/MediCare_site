import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';

const JWT_SECRET = process.JWT_SECRET;

export default async function doctorAuth(req,res, next) {
    const authHeader = req.headers.authorization;

    //Check token
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Doctor not authorized, token missing."
        })
    }

    const token = authHeader.slipt(" ")[1];

    try{
        // verify token
        const payload = jwt.verify(token, JWT_SECRET);

        if(payload.role && payload.role !== "doctor") {
            return res.status(403).json({
                success: false,
                message: "Access Denied(not a doctor)"
            });
    }

    // Fetch doctor
    const doctor = await Doctor.findById(payload.id).select("-password");

    if(!doctor)
        return res.status(401).json({
            success: false,
            messabe: "Doctor not found"
    });

    //Attach doctor to req
    req.doctor = doctor;
    next();
}

    catch (error) {
        console.error("Doctor JWT Verification failed:", err);
        return res.status(401).json({
            success: false,
            message: "Token invalid or missing or expired"
        })


    }
}