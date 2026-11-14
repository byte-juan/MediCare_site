import express from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { cancelAppointment, confirmPayment, createAppointment, getAppointments, getAppointmentsByDoctor, getAppointmentsByPatient, getRegisterdUserCount, getStats, updateAppointment } from '../controllers/appointmentController.js';

const appointmentRouter = express.Router();

appointmentRouter.get("/", getAppointments);
appointmentRouter.get("/confirm", confirmPayment);
appointmentRouter.get("/stats/summary", getStats);

// autenticar ROUTES
appointmentRouter.post('/', clerkMiddleware(), requireAuth(), createAppointment);
appointmentRouter.get("/me", clerkMiddleware(), requireAuth(), getAppointmentsByPatient);

appointmentRouter.get("/doctor/:doctoId", getAppointmentsByDoctor);

appointmentRouter.post("/:id/cancel", cancelAppointment);
appointmentRouter.get('/paitents/count', getRegisterdUserCount);
appointmentRouter.put("/:id", updateAppointment);

export default appointmentRouter;