import Service from "../models/Service.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Funciones de ayuda
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

function normalizeSlotsToMap(slotInput) {
  if (slotInput && typeof slotInput === "object" && !Array.isArray(slotInput)) {
    return slotInput;
  }

  let slotStrings = [];
  if (Array.isArray(slotInput)) {
    slotStrings = slotInput;
  } else if (typeof slotInput === "string") {
    try {
      const parsed = JSON.parse(slotInput);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
      slotStrings = parseJsonArrayField(slotInput);
    } catch {
      slotStrings = parseJsonArrayField(slotInput);
    }
  }

  const map = {};
  slotStrings.forEach((raw) => {
    const m = String(raw).match(
      /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s*•\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );
    if (!m) {
      map["unspecified"] = map["unspecified"] || [];
      map["unspecified"].push(raw);
      return;
    }
    const [, day, monShort, year, hour, minute, ampm] = m;
    const monthIdx = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].findIndex((x) => x.toLowerCase() === monShort.toLowerCase());
    const mm = String(monthIdx + 1).padStart(2, "0");
    const dd = String(Number(day)).padStart(2, "0");
    const dateKey = `${year}-${mm}-${dd}`;
    const timeStr = `${String(Number(hour)).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")} ${ampm.toUpperCase()}`;
    map[dateKey] = map[dateKey] || [];
    map[dateKey].push(timeStr);
  });
  return map;
}

const sanitizePrice = (v) =>
  Number(String(v ?? "0").replace(/[^\d.-]/g, "")) || 0;

const parseAvailability = (v) => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "available").toLowerCase();
  return s === "available" || s === "true";
};

// Para crear un servicio
export async function createService(req, res) {
  try {
    const b = req.body || {};
    const instructions = parseJsonArrayField(b.instructions);
    const slots = normalizeSlotsToMap(b.slots);
    const numericPrice = sanitizePrice(b.price);
    const available = parseAvailability(
      b.availability !== undefined ? b.availability : b.available
    );

    let imageUrl =
      typeof b.imageUrl === "string" && b.imageUrl.trim()
        ? b.imageUrl.trim()
        : null;
    let imagePublicId =
      typeof b.imagePublicId === "string" && b.imagePublicId.trim()
        ? b.imagePublicId.trim()
        : null;

    if (req.file) {
      try {
        const up = await uploadToCloudinary(req.file.path, "services");
        if (up?.secure_url) {
          imageUrl = up.secure_url;
          imagePublicId = up.public_id || null;
        }
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

    const service = new Service({
      name: b.name,
      about: b.about || "",
      shortDescription: b.shortDescription || "",
      price: numericPrice,
      available,
      instructions,
      slots,
      imageUrl,
      imagePublicId,
    });

    const saved = await service.save();
    return res.status(201).json({
      success: true,
      data: saved,
      message: "Servicio Creado",
    });
  } catch (err) {
    console.error("CreateService Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Para obtener todos los servicios
export async function getServices(req, res) {
  try {
    const list = await Service.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    console.error("GetServices Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Para obtener un servicio en particular por ID
export async function getServiceById(req, res) {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).lean();
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    console.error("GetServiceById Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Para actualizar un servicio
export async function updateService(req, res) {
  try {
    const { id } = req.params;
    const existing = await Service.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const b = req.body || {};
    const updateData = {};

    if (b.name !== undefined) updateData.name = b.name;
    if (b.about !== undefined) updateData.about = b.about;
    if (b.shortDescription !== undefined)
      updateData.shortDescription = b.shortDescription;
    if (b.price !== undefined) updateData.price = sanitizePrice(b.price);
    if (b.availability !== undefined)
      updateData.available = parseAvailability(b.availability);
    if (b.available !== undefined)
      updateData.available = parseAvailability(b.available);
    if (b.instructions !== undefined)
      updateData.instructions = parseJsonArrayField(b.instructions);
    if (b.slots !== undefined) updateData.slots = normalizeSlotsToMap(b.slots);
    if (typeof b.imageUrl === "string") {
      updateData.imageUrl = b.imageUrl.trim() || null;
    }

    if (req.file) {
      try {
        const up = await uploadToCloudinary(req.file.path, "services");
        if (up?.secure_url) {
          updateData.imageUrl = up.secure_url;
          updateData.imagePublicId = up.public_id || null;
          if (existing.imagePublicId) {
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

    const updated = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: "Service Actualizado",
    });
  } catch (err) {
    console.error("UpdateService Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Eliminar un servicio
export async function deleteService(req, res) {
  try {
    const { id } = req.params;
    const existing = await Service.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (existing.imagePublicId) {
      try {
        await deleteFromCloudinary(existing.imagePublicId);
      } catch (error) {
        console.warn("Failed to delete image from cloudinary:", error);
      }
    }

    await existing.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Service Deleted.",
    });
  } catch (err) {
    console.error("DeleteService Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}