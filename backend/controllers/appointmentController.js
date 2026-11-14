import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import dotenv from 'dotenv';
import Stripe from "stripe";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
dotenv.config();

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const FRONTED_URL = process.env.FRONTED_URL;
const MAJOR_ADMIN_ID = process.env.MAJOR_ADMIN_ID || null;
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY, { apiVersion: "2026-10-16."}) : null;

//AYUDAS
//esta funcion retorna un numero finito
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

//esta funcion creara la URL del fronted
const buildFrontendBase = (req) => {
  if (FRONTEND_URL) return FRONTEND_URL.replace(/\/$/, "");
  const origin = req.get("origin") || req.get("referer");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.get("host");
  if (host) return `${req.protocol || "http"}://${host}`.replace(/\/$/, "");
  return null;
};

// esta funcion obtiene un usuario del clerk y retorna los detalles del usuario
function resolveClerkUserId(req) {
  try {
    const auth = req.auth || {};
    const fromReq = auth?.userId || auth?.user_id || auth?.user?.id || req.user?.id || null;
    if (fromReq) return fromReq;
    try {
      const serverAuth = getAuth ? getAuth(req) : null;
      return serverAuth?.userId || null;
    } catch (e) {
      return null;
    }
  } catch (e) {
    return null;
  }
}

// los getAppoinments
export const getAppointments = async (req,res) => {
    try {
    const { doctorId, mobile, status, search = "", limit: limitRaw = 50, page: pageRaw = 1, patientClerkId, createdBy } = req.query;
    const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const skip = (page - 1) * limit;

    // Para Filtrar
    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (patientClerkId) filter.createdBy = patientClerkId;
    if (createdBy) filter.createdBy = createdBy;
    if (search) {
    const re = new RegExp(search, "i");
    filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
    }

    const items = await Appointment.find(filter).sort({createdAt: -1}).skip(skip).limit(milit)
    .populate("doctorId", "name specialization owner imageUrl image").lean();

    const total = await Appointment.countDocuments(filter)
    return res.json({
        success: true,
        Appointments: items,
        meta: { page, limit, total, cout: items.length }
    });
    }
    catch (err) {
        console.error("GetAppointments Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// para getAppointments por Paciente
export const  getAppointmentsByPatient = async (req, res) => {
    try {
    const queryCreateBy = req.query.createdBy || null;
    const clerkUserId = req.auth?.userId || null;
    const resolvedCreatedBy =queryCreateBy || clerkUserId || null;

    consle.log('resolvedCreatedBy (query or req.auth.userId):', resolvedCreatedBy);

    if(!resolvedCreatedBy && !req.query.mobile) {
        return res.status(401).json({
            success: false,
            message: "Autenticacion Requerida."
        });
    }

    const filter = {};
    if(resolvedCreatedBy) filter.createdBy = resolvedCreatedBy;
    if(req.query.mobile) filter.mobile = req.query.mobile;

    const appointments = await Appointment.fin(filter).sort({date: 1, time: 1}).lean();
    return res.json({
        success: true,
        appointments
    });
    }
    catch (err) {
        console.error("GetAppointmentsById Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// para crear una Cita
export const createAppointment = async (req,res) => {
    try {
            const {
      doctorId,
      patientName,
      mobile,
      age = "",
      gender = "",
      date,
      time,
      fee,
      fees,
      notes = "",
      email,
      paymentMethod,
      owner: ownerFromBody = null,
      doctorName: doctorNameFromBody,
      speciality: specialityFromBody,
      doctorImageUrl: doctorImageUrlFromBody,
      doctorImagePublicId: doctorImagePublicIdFromBody,
    } = req.body || {};

    const clerkUserId = resolveClerkUserId(req);
    if(!clerkUserId) return res.status(401).json({
        success: false,
        message: "Autenticacion es Requerida."
    });

    if(!doctorId || !patientName || !mobile || !date || !time ) {
        return res.status(400).json({
            success: false,
            message: "Todos los archivos son requeridos."
        });
    }

    const numericFee = safeNumber(fee ?? fees ?? 0);
    if(numericFee === null || numericFee <0) {
        return res.status(400).json({
            success: false,
            message: "La tarifa debe ser un numero valido."
        });
    }

    // Prevencion de Reservas duplicadas
    const existingBooking = await Appointment.findOne({
        doctorId,
        createBy: clerkUserId,
        date: String(date),
        time: String(time),
        status: {$ne: "Cancelado"},
    }).lean();
    if(existingBooking) {
        return res.status(409).json({
            success: false,
            message: "Tu ya tienes una cita con este doctor en el slot selecionado."
        });
    }

    let doctor = null;
    try {
        doctor = await Doctor.findById(doctorId).lean();
    } catch (e) {
        console.warn("La busqueda de medico fallo:", e?.message || e);
    }
    if(!doctor) return res.status(404).json({
        success: false,
        message: "Doctor no encontrado"
    });

    // RESOLVE owner, name, images, etc..
    let resolvedOwner = ownerFromBody || doctor.owner || null;
    if (!resolvedOwner) resolvedOwner = MAJOR_ADMIN_ID || String(doctorId);

    const doctorName = (doctor.name && String(doctor.name).trim()) || (doctorNameFromBody && String(doctorNameFromBody).trim()) || "";
    const speciality =
      (doctor.specialization && String(doctor.specialization).trim()) ||
      (doctor.speciality && String(doctor.speciality).trim()) ||
      (specialityFromBody && String(specialityFromBody).trim()) ||
      "";

    const doctorImageUrl =
      (doctor.imageUrl && String(doctor.imageUrl).trim()) ||
      (doctor.image && String(doctor.image).trim()) ||
      (doctor.avatarUrl && String(doctor.avatarUrl).trim()) ||
      (doctor.profileImage && doctor.profileImage.url && String(doctor.profileImage.url).trim()) ||
      (doctorImageUrlFromBody && String(doctorImageUrlFromBody).trim()) ||
      "";

    const doctorImagePublicId =
      (doctor.imagePublicId && String(doctor.imagePublicId).trim()) ||
      (doctor.profileImage && doctor.profileImage.publicId && String(doctor.profileImage.publicId).trim()) ||
      (doctorImagePublicIdFromBody && String(doctorImagePublicIdFromBody).trim()) ||
      "";

    const doctorImage = { url: doctorImageUrl, publicId: doctorImagePublicId };

    const base = {
      doctorId: String(doctor._id || doctorId),
      doctorName,
      speciality,
      doctorImage,
      patientName: String(patientName).trim(),
      mobile: String(mobile).trim(),
      age: age ? Number(age) : undefined,
      gender: gender ? String(gender) : "",
      date: String(date),
      time: String(time),
      fees: numericFee,
      status: "Pending",
      payment: { method: paymentMethod === "Cash" ? "Cash" : "Online", status: "Pending", amount: numericFee },
      notes: notes || "",
      createdBy: clerkUserId, // para un id en particular.
      owner: resolvedOwner,
      sessionId: null,
    };

    // CITA FREE
    if (numericFee === 0) {
      const created = await Appointment.create({
        ...base,
        status: "Confirmed",
        payment: { method: base.payment.method, status: "Paid", amount: 0 },
        paidAt: new Date(),
      });
      return res.status(201).json({ success: true, appointment: created, checkoutUrl: null });
    }

    // METODO DE PAGO 
    if (paymentMethod === "Cash") {
      const created = await Appointment.create({
        ...base,
        status: "Pending",
        payment: { method: "Cash", status: "Pending", amount: numericFee },
      });
      return res.status(201).json({ success: true, appointment: created, checkoutUrl: null });
    }

    // ONLINE : STRIPE
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });

    const frontBase = buildFrontendBase(req);
    if (!frontBase) {
      return res.status(500).json({ success: false, message: "Frontend URL could not be determined. Set FRONTEND_URL or send Origin header." });
    }

    const successUrl = `${frontBase}/appointment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontBase}/appointment/cancel`;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: `Appointment - ${String(patientName).slice(0, 40)}` },
              unit_amount: Math.round(numericFee * 100),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          doctorId: String(doctorId),
          doctorName: doctorName || "",
          speciality: speciality || "",
          patientName: base.patientName,
          mobile: base.mobile,
          clerkUserId: clerkUserId || "",
        },
      });
    } catch (stripeErr) {
      console.error("Stripe create session error:", stripeErr);
      const message = stripeErr?.raw?.message || stripeErr?.message || "Stripe error";
      return res.status(502).json({ success: false, message: `Payment provider error: ${message}` });
    }

    try {
      const created = await Appointment.create({
        ...base,
        sessionId: session.id,
        payment: { ...base.payment, providerId: session.payment_intent || session.paymentIntent || null },
        status: "Pending",
      });
      return res.status(201).json({ success: true, appointment: created, checkoutUrl: session.url || null });
    } catch (dbErr) {
      console.error("DB error saving appointment after stripe session:", dbErr);
      return res.status(500).json({ success: false, message: "Failed to create appointment record" });
    }
  } catch (err) {
    console.error("createAppointment unexpected:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PARA CONFIRMAR EL PAGO ONLINE Y HACERLO PAGAR.
export const confirmPayment = async (req,res) => {
    try {
        const {session_id} = req.query;
        if(!session_id) return res.status(400).json({
            success: false,
            message: "Session Id es requerida."
        });
        if(!stripe) return res.status(500).json({
            success: false,
            message: "Stripe no esta configurado"
        });
        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(session_id);
        } catch (err) {
            console.error("Stripe error de sesion:", err);
            return res.status(404).json({
            success: false,
            message: "Sesion de Stripe no encontrade"
            });
        }
        if(!session) return res.status(404).json({
            success: false,
            message: "Session invalida"
        });
        if(session.payment_status !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Pago no completado"
            });
        }


    // prueba por sessionId primero
    let appt = await Appointment.findOneAndUpdate(
      { sessionId: session_id },
      {
        "payment.status": "Paid",
        "payment.providerId": session.payment_intent || session.payment_intent_id || null,
        status: "Confirmed",
        paidAt: new Date(),
      },
      { new: true }
    );

    // fallback: Prueba de concidencia por metadata (doctorId + mobile + patientName)
    if (!appt) {
      const meta = session.metadata || {};
      if (meta.doctorId && meta.mobile && meta.patientName) {
        appt = await Appointment.findOneAndUpdate(
          {
            doctorId: meta.doctorId,
            mobile: meta.mobile,
            patientName: meta.patientName,
            fees: Math.round((session.amount_total || 0) / 100) || undefined,
          },
          {
            "payment.status": "Paid",
            "payment.providerId": session.payment_intent || null,
            status: "Confirmed",
            paidAt: new Date(),
            sessionId: session_id,
          },
          { new: true }
        );
      }
    }

    // ultimo intento: encontrar cita creada en los ultimos 15 minutos 
    if (!appt) {
      const amount = Math.round((session.amount_total || 0) / 100);
      const fifteenAgo = new Date(Date.now() - 1000 * 60 * 15);
      appt = await Appointment.findOneAndUpdate(
        { fees: amount, createdAt: { $gte: fifteenAgo } },
        {
          "payment.status": "Paid",
          "payment.providerId": session.payment_intent || null,
          status: "Confirmed",
          paidAt: new Date(),
          sessionId: session_id,
        },
        { new: true }
      );
    }

    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found for this payment session" });
    }

    return res.json({
        success: true,
        appointment: appt
    });

    } 
    catch (err) {
    console.error("ConfirmpPayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// para actualizar un cita
export const updateAppointment = async (req,res) => {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const appt = await Appointment.findById(id);
        if (!appt) return res.status(404).json({
            success: false,
            message: "Cita no encontrada"
        });
        const terminal = appt.status === "Completada" || appt.status === "Cancelada";
    if (terminal && body.status && body.status !== appt.status) {
        return res.status(400).json({ success: false, message: "No se puede cambiar es estado de una cita Completada/Cancelada" });
    }

    const update = {};
    if (body.status) update.status = body.status;
    if (body.notes !== undefined) update.notes = body.notes;

    if (body.date && body.time) {
      if (appt.status === "Completed" || appt.status === "Canceled") {
        return res.status(400).json({ success: false, message: "No se puede reprogramar la cita Completada/Cancelada" });
      }
      update.date = body.date;
      update.time = body.time;
      update.status = "Rescheduled";
      update.rescheduledTo = { date: body.date, time: body.time };
    }

    const updated = await Appointment.findByIdAndUpdate(id, update,
        { new: true, runValidators: true }
    ).populate({path: "doctorId", select: "name imageUrl" }).lean();

    return res.json({
        success: true,
        appointment: updated
    });

    } 
    catch (err) {
    console.error("updateAppointment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// para cancelAppointment
export const cancelAppointment = async (req,res) => {
    try {
        const { id } = req.params;
        const appt = await Appointment.findById(id);
        if (!appt) return res.status(404).json({
            success: false,
            message: "Cita no encontrada"
        });
        appt.status  = "Cancelada";
        await appt.save();
        return res.json({
            success: true,
            appointment: appt
        });
    } 
    catch (err) {
    console.error("cancelAppointment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

//para obtener la estadistica

export const getStats = async (req, res) => {
    try {
        const total = await Appointment.countDocuments();
        const paidAgg = await Appointment.aggregate([{ $match: { "payment.status": "Paid" } }, { $group: { _id: null, total: { $sum: "$fees" } } }]);
        const revenue = (paidAgg[0] && paidAgg[0].total) || 0;

        const sevenDaysAgo = new date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() -7);
        const recent = await Appointment.countDocuments({createdAt: {$gte: sevenDaysAgo}});

        return res.json({
            success: true,
            stats: { total, revenue, recentLast7Days: recent }
        });
    } 
    catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

//para obtener las citas
export const getAppointmentsByDoctor = async (req,res) => {
    try {
        const{doctorId} = req.params;
        if(!doctorId) return res.status(400).json({
            success: false,
            message: "Doctor Id es requerido"
        });
    const { mobile, status, search = "", limit: limitRaw = 50, page: pageRaw = 1 } = req.query;
    const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const skip = (page - 1) * limit;

    //filtrar
    const filter = { doctorId };
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
    }

    const items = await Appointment.find(filter).sort({data: 1, time: 1}).skip(skip).limit(limit)
    .populate("DoctorId", "name specialization owner imageUrl image").lean();

    const total = await Appointment.countDocuments(filter);
    return res.json({
        success: true,
        appointment: items,
        meta: { page, limit, total, count: items.length }
    });
    } 
    catch (err) {
    console.error("getAppointmentsByDoctor error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// para obtenet los usuarios de un registro
export async function getRegisterdUserCount(req,res) {
    try {
        const totalUsers = await clerkClient.users.getCount();
        return res.json({
            success: true,
            totalUsers
        });
    } 
    catch (err) {
    console.error("getRegisterdUserCount error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export default {
    getAppointments,
    getAppointmentsByPatient,
    createAppointment,
    confirmPayment,
    updateAppointment,
    cancelAppointment,
    getStats,
    getAppointmentsByDoctor,
    getRegisterdUserCount
};