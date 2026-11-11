import Doctor from "../models/Doctor.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// FUNCIONES DE AYUDA
// esta funcion convertira el tiempo 12hrs en numero de minutos dede la medianoche
// y retorna ap : pm
const parseTimeToMinutes = (t = "") => {
  const [time = "0:00", ampm = ""] = (t || "").split(" ");
  const [hh = 0, mm = 0] = time.split(":").map(Number);
  let h = hh % 12;
  if ((ampm || "").toUpperCase() === "PM") h += 12;
  return h * 60 + (mm || 0);
};

//esta funcion removera el slot duplicado y regresa el filtro del slot por tiempo
function dedupeAndSortSchedule(schedule = {}) {
  const out = {};
  Object.entries(schedule).forEach(([date, slots]) => {
    if (!Array.isArray(slots)) return;
    const uniq = Array.from(new Set(slots));
    uniq.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    out[date] = uniq;
  });
  return out;
}

//esta funcion accepta el obj o JSON string
function parseScheduleInput(s) {
  if (!s) return {};
  if (typeof s === "string") {
    try {
      s = JSON.parse(s);
    } catch {
      return {};
    }
  }
  return dedupeAndSortSchedule(s || {});
}

//esta funcion convierte doctor data a plain text
function normalizeDocForClient(raw = {}) {
  const doc = { ...raw };

  // convert Mongoose Map to plain object
  if (doc.schedule && typeof doc.schedule.forEach === "function") {
    const obj = {};
    doc.schedule.forEach((val, key) => {
      obj[key] = Array.isArray(val) ? val : [];
    });
    doc.schedule = obj;
  } else if (!doc.schedule || typeof doc.schedule !== "object") {
    doc.schedule = {};
  }

  doc.availability =
    doc.availability === undefined ? "Available" : doc.availability;
  doc.patients = doc.patients ?? "";
  doc.rating = doc.rating ?? 0;
  doc.fee = doc.fee ?? doc.fees ?? 0;

  return doc;
}

// para crear un Doctor
export async function createDoctor(req, res){
    try{
        const body= req.body || {};
        if(!body.email || !body.password || !body.name){
            return res.status(400).json({
                success: false,
                message: "Nombre, correo y password son requeridas. "
            })
        }

        const emailLC = (body.email || "").toLowerCase():
        if(await Doctor .findOne({ email: emailLC})) {
            return res.status(409).json({
                success: false,
                message: "Email ya esta en uso"
            })
        }

        let imgeURL = body.imageUrl || null;
        let imagePublicId = body.imagePublicId || null;
        if (req.file?.path) {
            const uploaded = await uploadToCloudinary(req.file.path, "doctors");
            imageUrl = upleaded?.secure_url || uploaded?.url || imageUrl;
            imagePublicId = uploaded?.public_id || uploaded?.public_id || imagePublicId;
        }

        const schedule = parseScheduleInput(body.schedule);
        // createDoctor
    const doc = new Doctor({
      email: emailLC,
      password: body.password,
      name: body.name,
      specialization: body.specialization || "",
      imageUrl,
      imagePublicId,
      availability: body.availability || "Available",
      experience: body.experience || "",
      qualifications: body.qualifications || "",
      location: body.location || "",
      about: body.about || "",
      fee: body.fee !== undefined ? Number(body.fee) : 0,
      schedule,
      success: body.success || "",
      patients: body.patients || "",
      rating: body.rating !== undefined ? Number(body.rating) : 0,
    });
    }

    catch(error) {

    }
}
