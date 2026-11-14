import express from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

import { cancelServiceAppointment, confirmSevicePayment, createServiceAppointment, getServiceAppointmentById, getServiceAppointmentByPatient, getServiceAppointments, getServiceAppointmentStats, updateServiceAppointment } from '../controllers/serviceAppointmentController.js';

const serviceAppointmentRouter = express.Router();

serviceAppointmentRouter.get("/", getServiceAppointments);
serviceAppointmentRouter.get("/confirm", confirmSevicePayment),
serviceAppointmentRouter.get("/stas/summary", getServiceAppointmentStats);

serviceAppointmentRouter.post("/", clerkMiddleware(),requireAuth(), createServiceAppointment);

serviceAppointmentRouter.get("/me", clerkMiddleware(), requireAuth(), getServiceAppointmentByPatient);

serviceAppointmentRouter.get("/:id", getServiceAppointmentById);
serviceAppointmentRouter.put("/:id", updateServiceAppointment);
serviceAppointmentRouter.post("/:id/cancel", cancelServiceAppointment);

export default serviceAppointmentRouter;