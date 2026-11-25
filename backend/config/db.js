import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://bytejuan_db_user:codigo7agustin6@clinicmedic-cluster.0rufgtk.mongodb.net/MediCare")
    .then(() => {
        console.log("DB CONNECTED")
    })
}
