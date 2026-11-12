import express from 'express';
import multer from 'multer';

import { createDoctor, doctorLogin, getDoctors } from '../controllers/doctorController.js';

import doctorAuth from '../middlewares/doctorAuth.js';

const upload = multer({dest: "/tmp"});

const doctorRouter = express.Router();

doctorRouter.get("/", getDoctors);
doctorRouter.post('/login', doctorLogin);

doctorRouter.get("/:id", getDoctorById);
doctorRouter.post("/", upload.single("image"), createDoctor);

// after login
doctorRouter.put("/:id", )
