import React, { useEffect, useRef, useState } from "react";
import { addServiceStyles } from "../assets/dummyStyles";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Image,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";

const AddService = ({ serviceId }) => {
  const API_BASE = "http://localhost:4000";

  const fileRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [hasExistingImage, setHasExistingImage] = useState(false); // para actualizar la imagen si se encuentra
  const [removeImage, setRemoveImage] = useState(false); // si existe una

  const [serviceName, setServiceName] = useState("");
  const [about, setAbout] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("available");

  const [instructions, setInstructions] = useState([""]);
  const [slots, setSlots] = useState([]);

  // Fecha/Hora control para agregar slots
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const years = Array.from({ length: 5 }).map((_, i) => currentYear + i);
  const months = [
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
  ];
  const hours = Array.from({ length: 12 }).map((_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 12 }).map((_, i) =>
    String(i * 5).padStart(2, "0"),
  );
  const ampm = ["AM", "PM"];

  // iniciar los valores como cadenas
  const [slotDay, setSlotDay] = useState(String(currentDate));
  const [slotMonth, setSlotMonth] = useState(String(currentMonth));
  const [slotYear, setSlotYear] = useState(String(currentYear));
  const [slotHour, setSlotHour] = useState("11");
  const [slotMinute, setSlotMinute] = useState("00");
  const [slotAmPm, setSlotAmPm] = useState("AM");

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // calcular el día para month/year seleccionado (respetando la duración del mes)
  const selectedYearNum = Number(slotYear);
  const selectedMonthNum = Number(slotMonth);
  const daysInSelectedMonth = new Date(
    selectedYearNum,
    selectedMonthNum + 1,
    0,
  ).getDate();
  const days = Array.from({ length: daysInSelectedMonth }).map((_, i) =>
    String(i + 1),
  );

  useEffect(() => {
    if (Number(slotDay) > daysInSelectedMonth) {
      setSlotDay(String(daysInSelectedMonth));
    }
  }, [slotMonth, slotYear, daysInSelectedMonth]);

  // para cargar los servicios cuando está en modo edición
  useEffect(() => {
    let mounted = true;
    async function loadService() {
      if (!serviceId) return;
      try {
        const res = await fetch(`${API_BASE}/api/services/${serviceId}`);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.warn("Failed to fetch service:", res.status, txt);
          showToast(
            "error",
            "Load failed",
            "Could not load service for editing.",
          );
          return;
        }
        const payload = await res.json().catch(() => null);
        const data = payload?.data || payload;
        if (!data) return;
        if (!mounted) return;

        setServiceName(data.name || "");
        setAbout(data.about || data.description || "");
        setPrice(data.price != null ? String(data.price) : "");
        setAvailability(data.available ? "available" : "unavailable");
        setInstructions(
          Array.isArray(data.instructions) && data.instructions.length
            ? data.instructions
            : [""],
        );
        setSlots(Array.isArray(data.slots) ? data.slots : []);
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
          setHasExistingImage(true);
          setRemoveImage(false);
        } else {
          setImagePreview(null);
          setHasExistingImage(false);
        }
      } catch (err) {
        console.error("loadService error:", err);
        showToast("error", "Network error", "Could not load service.");
      }
    }
    loadService();
    return () => {
      mounted = false;
    };
  }, [serviceId, API_BASE]);

  // cambio de imagen
  function handleImageChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch (err) {}
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setRemoveImage(false);
    setHasExistingImage(false);
  }

  // instrucciones de ayuda
  function addInstruction() {
    setInstructions((s) => [...s, ""]);
  }
  function updateInstruction(i, v) {
    setInstructions((s) => s.map((x, idx) => (idx === i ? v : x)));
  }
  function removeInstruction(i) {
    setInstructions((s) => s.filter((_, idx) => idx !== i));
  }

  // restablecer el formulario a su estado inicial
  function resetForm() {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch (err) {}
    }
    setImagePreview(null);
    setImageFile(null);
    setHasExistingImage(false);
    setRemoveImage(false);
    setServiceName("");
    setAbout("");
    setPrice("");
    setAvailability("available");
    setInstructions([""]);
    setSlots([]);
    setErrors({});
  }

  // mostrar mensaje por 3.5 segundos
  function showToast(type, title, message) {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  }

  // convertir las 12Horas seleccionadas en un objeto fecha
  function selectedDateTime() {
    const d = Number(slotDay);
    const m = Number(slotMonth);
    const y = Number(slotYear);
    let h = Number(slotHour);
    const mm = Number(slotMinute);
    const ap = slotAmPm;

    if (ap === "AM") {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h = h + 12;
    }

    return new Date(y, m, d, h, mm, 0, 0);
  }

  // prevenir al usuario seleccionar un tiempo pasado
  function isSelectedDateTimeInPast() {
    const sel = selectedDateTime();
    return sel.getTime() <= Date.now();
  }

  // para agregar y actualizar slots
  function addSlot() {
    const m = months[Number(slotMonth)];
    const d = String(slotDay).padStart(2, "0");
    const y = slotYear;
    const h = String(slotHour).padStart(2, "0");
    const mm = slotMinute;
    const ap = slotAmPm;
    const formatted = `${d} ${m} ${y} • ${h}:${mm} ${ap}`;

    if (slots.includes(formatted)) {
      showToast(
        "error",
        "Slot Duplicado",
        "Este horario ya fue agregado. Por favor selecciona otro diferente.",
      );
      return;
    }

    if (isSelectedDateTimeInPast()) {
      showToast(
        "error",
        "Tiempo Pasado",
        "Tu no puede agregar un horario del pasado . Por favor selecciona una fecha/hora del futuro.",
      );
      setErrors((e) => ({ ...e, slots: true }));
      return;
    }

    setSlots((s) => [...s, formatted]);
    setErrors((e) => ({ ...e, slots: false }));
    showToast("success", "Slot Agregado", `Time slot added: ${formatted}`);
  }

  function removeSlot(i) {
    const removedSlot = slots[i];
    setSlots((s) => s.filter((_, idx) => idx !== i));
    showToast("info", "Slot Removido", `Removido: ${removedSlot}`);
  }

  // para validar todos los campos
  function validate() {
    const newErrors = {};
    if (!imageFile && !hasExistingImage) newErrors.image = true;
    if (!serviceName.trim()) newErrors.serviceName = true;
    if (!about.trim()) newErrors.about = true;
    if (!String(price).trim()) newErrors.price = true;
    if (!instructions.some((ins) => ins.trim())) newErrors.instructions = true;
    if (!slots.length) newErrors.slots = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // entregar la función para crear o actualizar
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      showToast(
        "error",
        "Missing Fields",
        "Please fill all required fields before submitting.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", serviceName);
      fd.append("about", about);
      const numericPrice = String(price).replace(/[^\d.-]/g, "");
      fd.append("price", numericPrice === "" ? "0" : numericPrice);
      fd.append("availability", availability);
      fd.append("instructions", JSON.stringify(instructions));
      fd.append("slots", JSON.stringify(slots));

      if (imageFile) {
        fd.append("image", imageFile);
      } else if (removeImage) {
        fd.append("removeImage", "true");
      }

      const url = serviceId
        ? `${API_BASE}/api/services/${serviceId}`
        : `${API_BASE}/api/services`;
      const method = serviceId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || `Server error (${res?.status || "?"})`;
        showToast("error", "Save Failed", msg);
        setSubmitting(false);
        return;
      }

      showToast(
        "success",
        serviceId ? "Service Updated" : "Service Added",
        `${serviceName} saved with ${slots.length} slot(s).`,
      );

      if (!serviceId) {
        resetForm();
        if (fileRef.current) fileRef.current.value = null;
      } else {
        const saved = data?.data || null;
        if (saved) {
          setHasExistingImage(Boolean(saved.imageUrl));
          setImagePreview(saved.imageUrl || null);
          setImageFile(null);
          setRemoveImage(false);
        }
      }
    } catch (err) {
      console.error("service submit error:", err);
      showToast("error", "Network error", "Could not reach server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={addServiceStyles.container.main}>
      <div className={addServiceStyles.toast.container}>
        {toast && (
          <div
            className={`${addServiceStyles.toast.toastBase} ${
              toast.type === "error"
                ? addServiceStyles.toast.toastError
                : toast.type === "info"
                  ? addServiceStyles.toast.toastInfo
                  : addServiceStyles.toast.toastSuccess
            } animate-slideIn`}
          >
            <div className={addServiceStyles.toast.iconContainer(toast.type)}>
              {toast.type === "error" ? (
                <AlertTriangle className="w-5 h-5" />
              ) : toast.type === "info" ? (
                <Clock className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={addServiceStyles.toast.title}>{toast.title}</div>
              <div className={addServiceStyles.toast.message}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => setToast(null)}
              className={addServiceStyles.buttons.toastClose}
            >
              <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={addServiceStyles.container.form}>
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center
        justify-between mb-6 sm:mb-8 gap-4"
        >
          <div>
            <h1 className={addServiceStyles.header.title}>
              {serviceId ? "Editar Servicio" : "Agregar Servicio"}
            </h1>
            <p className={addServiceStyles.header.subtitle}>
              Crea una tarjeta de servicio con franjas horarias únicas.
            </p>
          </div>
          <div className={addServiceStyles.headerActions}>
            <button
              type="button"
              onClick={resetForm}
              className={addServiceStyles.buttons.reset}
            >
              Reiniciar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={addServiceStyles.buttons.submit}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {serviceId ? "Actualizar Servicio" : "Guardar Servicio"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* left side */}
        <div className={addServiceStyles.grids.main}>
          <div className="lg:col-span-1 md:col-span-1 col-span-1 flex-col items-center">
            <div
              className={addServiceStyles.imageUpload.container(errors.image)}
            >
              <div className={addServiceStyles.imageUpload.preview}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={addServiceStyles.imageUpload.placeholder}>
                    <Image className="w-10 h-10" />
                    <div className="mt-2 text-sm">
                      Imagen de Servicio (requerida)
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={addServiceStyles.buttons.uploadImage}
                >
                  <Plus className="w-4 h-4" />{" "}
                  {imagePreview ? "Reemplazar imagen" : "Subir imagen"}
                </button>

                {(imagePreview || hasExistingImage) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreview && imagePreview.startsWith("blob:")) {
                        try {
                          URL.revokeObjectURL(imagePreview);
                        } catch (err) {}
                      }
                      setImagePreview(null);
                      setImageFile(null);
                      if (hasExistingImage) {
                        setRemoveImage(true);
                        setHasExistingImage(false);
                      }
                      if (fileRef.current) fileRef.current.value = null;
                    }}
                    className={addServiceStyles.buttons.removeImage}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>

              {hasExistingImage && (
                <div className="w-full text-xs text-gray-600 mt-2 flex items-center gap-2">
                  <input
                    id="remove-img"
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => {
                      setRemoveImage(Boolean(e.target.checked));
                      if (e.target.checked) {
                        setImagePreview(null);
                        setImageFile(null);
                        setHasExistingImage(false);
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor="remove-img">Remove existing image</label>
                </div>
              )}
            </div>
          </div>

          {/* right side */}
          <div className="lg:col-span-2 md:col-span-1 col-span-1 space-y-6">
            <div className={addServiceStyles.grids.formFields}>
              <div>
                <label className={addServiceStyles.labels.standard}>
                  Nombre de Servicio
                </label>
                <input
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. General Consultation"
                  className={addServiceStyles.formFields.input(
                    errors.serviceName,
                  )}
                />
              </div>

              <div>
                <label className={addServiceStyles.labels.standard}>
                  Precio
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="S/ 499"
                  className={addServiceStyles.formFields.input(errors.price)}
                  inputMode="numeric"
                />

                <div className="mt-3">
                  <label className={addServiceStyles.labels.standard}>
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className={addServiceStyles.formFields.select}
                  >
                    <option value="available">Disponible</option>
                    <option value="unavailable">Ocupado</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className={addServiceStyles.labels.standard}>
                Acerca de este servicio
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Descripcion Corta"
                rows={4}
                className={addServiceStyles.formFields.textarea(errors.about)}
              />
            </div>
            {/* instructions */}
            <div>
              <div className="flex items-center justify-between">
                <label className={addServiceStyles.labels.standard}>
                  Instrucciones (punto * punto)
                </label>
                <button
                  type="button"
                  onClick={addInstruction}
                  className={addServiceStyles.buttons.addInstruction}
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              <div
                className={addServiceStyles.instructions.container(
                  errors.instructions,
                )}
              >
                {instructions.map((ins, idx) => (
                  <div key={idx} className={addServiceStyles.instructions.item}>
                    <div className={addServiceStyles.icon.number}>
                      {idx + 1}.
                    </div>
                    <input
                      value={ins}
                      onChange={(e) => updateInstruction(idx, e.target.value)}
                      placeholder={`Instruction ${idx + 1}`}
                      className={addServiceStyles.instructions.input}
                    />
                    {instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(idx)}
                        className={addServiceStyles.instructions.removeButton}
                      >
                        <Trash2
                          className={addServiceStyles.icon.removeInstruction}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* slot controls */}
            <div className={addServiceStyles.slots.container(errors.slots)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <Calendar className="w-5 h-5" /> Horario y Disponibilidad
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500">
                    {slots.length} slot{slots.length !== 1 ? "s" : ""} added
                  </div>
                </div>
              </div>
              <div className={addServiceStyles.grids.timeGrid}>
                <div className="min-w-0">
                  <label className={addServiceStyles.labels.small}>Dia</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value)}
                    className={addServiceStyles.formFields.smallSelect}
                  >
                    {days.map((d) => {
                      const dNum = Number(d);
                      const disabled =
                        Number(slotYear) === currentYear &&
                        Number(slotMonth) === currentMonth &&
                        dNum < currentDate;
                      return (
                        <option key={d} value={d} disabled={disabled}>
                          {d}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className={addServiceStyles.labels.small}>Mes</label>
                  <select
                    value={slotMonth}
                    onChange={(e) => setSlotMonth(e.target.value)}
                    className={addServiceStyles.formFields.smallSelect}
                  >
                    {months.map((m, idx) => {
                      const disabled =
                        Number(slotYear) === currentYear && idx < currentMonth;
                      return (
                        <option key={m} value={String(idx)} disabled={disabled}>
                          {m}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className={addServiceStyles.labels.small}>Año</label>
                  <select
                    value={slotYear}
                    onChange={(e) => setSlotYear(e.target.value)}
                    className={addServiceStyles.formFields.smallSelect}
                  >
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={addServiceStyles.grids.timeSubGrid}>
                  <div className="min-w-0">
                    <label className={addServiceStyles.labels.small}>
                      Hora
                    </label>
                    <select
                      value={slotHour}
                      onChange={(e) => setSlotHour(e.target.value)}
                      className={addServiceStyles.formFields.timeSelect}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className={addServiceStyles.labels.small}>
                      Minuto
                    </label>
                    <select
                      value={slotMinute}
                      onChange={(e) => setSlotMinute(e.target.value)}
                      className={addServiceStyles.formFields.timeSelect}
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className={addServiceStyles.labels.small}>
                      AM/PM
                    </label>
                    <select
                      value={slotAmPm}
                      onChange={(e) => setSlotAmPm(e.target.value)}
                      className={addServiceStyles.formFields.ampmSelect}
                    >
                      {ampm.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={addSlot}
                  className={addServiceStyles.buttons.addSlot}
                >
                  <Plus className="w-4 h-4" /> Agregar este Horario
                </button>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">
                  Agregar Slots ({slots.length})
                </div>
                <div className={addServiceStyles.grids.slotsGrid}>
                  {slots.length === 0 ? (
                    <div className="text-sm text-gray-400 italic px-4 py-2">
                      Aún no se han añadido franjas horarias. Seleccione una
                      hora y haga clic en "Añadir esta franja horaria".
                    </div>
                  ) : (
                    slots.map((s, idx) => (
                      <div key={s} className={addServiceStyles.slots.slotItem}>
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className={addServiceStyles.icon.clock} />
                          <div className={addServiceStyles.slots.slotText}>
                            {s}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSlot(idx)}
                          className={addServiceStyles.buttons.slotRemove}
                        >
                          <Trash2 className={addServiceStyles.icon.trash} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <style>{addServiceStyles.customCSS}</style>
    </div>
  );
};

export default AddService;
