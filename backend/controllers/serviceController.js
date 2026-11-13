import Service from "../models/Service.js";
import service from "../models/Service.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

//funciones de ayuda 
//funcion para convertir un array como  input en un array limpio
// cuando esta vacia o invalida retorna en un array vacio ie: [];
const parseJsonArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
      return typeof parsed === "string" ? [parsed] : [];
    } catch {
      return field
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

//so esta funcion toma fecha y hora y las agrupa en 
// yyyy-mm-dd con el tiempo
function normalizeSlotsToMap(slotStrings = []) {
  const map = {};
  slotStrings.forEach((raw) => {
    const m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s*•\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) {
      // fallback: keep raw in an "unspecified" bucket
      map["unspecified"] = map["unspecified"] || [];
      map["unspecified"].push(raw);
      return;
    }
    const [, day, monShort, year, hour, minute, ampm] = m;
    const monthIdx = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      .findIndex(x => x.toLowerCase() === monShort.toLowerCase());
    const mm = String(monthIdx + 1).padStart(2, "0");
    const dd = String(Number(day)).padStart(2, "0");
    const dateKey = `${year}-${mm}-${dd}`; // YYYY-MM-DD
    const timeStr = `${String(Number(hour)).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm.toUpperCase()}`;
    map[dateKey] = map[dateKey] || [];
    map[dateKey].push(timeStr);
  });
  return map;
}

//lo convierte con seguridad en un numero
const sanitizePrice = (v) => Number(String(v ?? "0").replace(/[^\d.-]/g, "")) || 0;
const parseAvailability = (v) => {
  const s = String(v ?? "available").toLowerCase();
  return s === "available" || s === "true";
};

// para crear un servicio
export async function createService(req,res){
    try {
    const b = req.body || {};
    const instructions = parseJsonArrayField(b.instructions);
    const rawSlots = parseJsonArrayField(b.slots);
    const slots = normalizeSlotsToMap(rawSlots);
    const numericPrice = sanitizePrice(b.price);
    const available = parseAvailability(b.availability);

    let imageUrl = null;
    let imagePublicId = null;
    if (req.file) {
      try {
        const up = await uploadToCloudinary(req.file.path, "services");
        imageUrl = up?.secure_url || null;
        imagePublicId = up?.public_id || null;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }// si el archivo es actual se subira a la carpeta servicios in el cloudinary

    const service = new Service({
        name: b.name,
        about: b.about || "",
        shortDescription: b.shortDescription || "",
        price: numericPrice,
        available,
        instructions,
        slots,
        imageUrl,
        imagePublicId
    });
    const saved = await service.save();
    return res.status(201).json({
        success: true,
        data: saved,
        message: "Servicio Creado"
    });
    }

    catch (err) {
        console.error("CreateService Error:", err)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}

//para obtener todos los servicios
export async function getServices(req,res) {
    try {
        const list = await service.find().sort({ createAt: -1}).lean();
        return res.status(200).json({
            success: true,
            date: list
        });
    }
        catch (err) {
        console.error("GetServices Error", err)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}

//  para obtener un servicio en particular por ID
export async function getServiceById(req,rex) {
    try {
        const {id} = req.params;
        const service = await Service.finById(id).lean();
        if (!service) return res.status(404).json({
            success: false,
            message: "Service not found"
        });
        
        return res.status(200).json({
            success: true,
            date: service
        });
    }

        catch (err) {
        console.error("GetServiceById Error:", err)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}

// para actualizar un servicio
export async function updateService(req,res) {
    try {
    const { id } = req.params;
    const existing = await Service.finById(id);
    if (!existing) return res.status(404).json({
        success: false,
        message: "Service not found"
    });

    const b = req.body || {};
    const updateData = {};k

    // para actualizar un campo que ya esta presente
        if (b.name !== undefined) updateData.name = b.name;
    if (b.about !== undefined) updateData.about = b.about;
    if (b.shortDescription !== undefined) updateData.shortDescription = b.shortDescription;
    if (b.price !== undefined) updateData.price = sanitizePrice(b.price);
    if (b.availability !== undefined) updateData.available = parseAvailability(b.availability);
    if (b.instructions !== undefined) updateData.instructions = parseJsonArrayField(b.instructions);
    if (b.slots !== undefined) updateData.slots = normalizeSlotsToMap(parseJsonArrayField(b.slots));

    if (req.file) {
      try {
        const up = await uploadToCloudinary(req.file.path, "services");
        if (up?.secure_url) {
          updateData.imageUrl = up.secure_url;
          updateData.imagePublicId = up.public_id || null;
          if (existing.imagePublicId) {
            //la imagen vieja sera removida y remplazada por la nueva
            try {
              await deleteFromCloudinary(existing.imagePublicId);
            } catch (err) {
              console.warn("Cloudinary delete failed:", err?.message || err);
            }
          }
        }
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

        const  updated = await Service.finByIdAndUpdate(id, updateData, {
            new: true,
            runValidatos: true
        });

        return res.status(200).json({
            success: true,
            date: update,
            message: "Service Actualizado"
        });
    }
        catch (err) {
        console.error("UpdateService Error:", err)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}

// eliminar un Servicio
export async function deleteService(req,res) {
    try {
        const { id } = req.params;
        const existing = await Service.finById(id);
        if (!existing) return res.status(404).json({
        success: false,
        message: "Service not found"
    });

    if(existing.imagePublicId) {
        try {
            await deleteFromCloudinary(existing.imagePublicId);
        }  catch(error) {
            console.warm("Failed to delte image from cloudinary:")

        }
    }
    await existing.delteOne();
    return res.status(200).json({
        success: true,
        message: "Service Deleted."
    });
    }
        catch (err) {
        console.error("DeleteService Error:", err)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}