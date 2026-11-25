import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  FileText,
  Send,
  Phone,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import toast, { Toaster } from "react-hot-toast";
import { serviceDetailStyles, iconSize } from "../assets/dummyStyles";

const DEFAULT_HOST = (
  import.meta.env.VITE_API_BASE || "http://localhost:4000"
).replace(/\/$/, "");

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isSignedIn, getToken } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isValidMobile = (m) => /^\d{9,10}$/.test(m);

  const isValidAge = (a) => {
    if (a === "" || a === null || a === undefined) return false;
    const n = Number(a);
    return Number.isInteger(n) && n > 0 && n < 150;
  };

  function getClientMissingFields() {
    const missing = [];
    if (!customerName || !customerName.trim()) missing.push("nombre del paciente");
    if (!mobile || !isValidMobile(mobile)) missing.push("celular (9 dígitos)");
    if (!selectedDate) missing.push("fecha");
    if (!selectedTime) missing.push("hora");

    if (!isValidAge(age)) missing.push("edad (número entero válido)");
    if (!gender || !String(gender).trim()) missing.push("género");
    return missing;
  }

  const isFormValid = () => getClientMissingFields().length === 0;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const endpoints = [
      `${DEFAULT_HOST}/api/services/${encodeURIComponent(id)}`,
    ];

    async function tryFetch() {
      setLoading(true);
      setFetchError(null);

      let lastError = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          if (res.status === 404) {
            lastError = new Error(`404 ${url}`);
            continue;
          }

          const contentType = res.headers.get("content-type") || "";
          if (!res.ok || !contentType.includes("application/json")) {
            const txt = await res.text().catch(() => "");
            lastError = new Error(
              `Respuesta inválida ${res.status} en ${url}: ${String(txt).slice(
                0,
                200,
              )}`,
            );
            continue;
          }

          const json = await res.json().catch(() => null);
          const doc = json?.data ?? json?.service ?? json;

          if (!doc) {
            lastError = new Error(`Sin datos del servicio en ${url}`);
            continue;
          }

          const transformed = transformServiceShape(doc);

          if (!mounted) return;
          setService(transformed);
          if (transformed.dates && transformed.dates.length > 0) {
            setSelectedDate(transformed.dates[0]);
            setSelectedTime("");
          }
          setLoading(false);
          return;
        } catch (err) {
          if (err.name === "AbortError") return;
          lastError = err;
          continue;
        }
      }

      if (!mounted) return;
      console.warn(
        "All endpoints failed, falling back to local servicesData. Last error:",
        lastError,
      );
      const local =
        typeof servicesData !== "undefined" &&
        servicesData &&
        servicesData.find((s) => String(s.id) === String(id));
      if (local) {
        const cloned = JSON.parse(JSON.stringify(local));
        if (
          !cloned.slots ||
          (Array.isArray(cloned.slots) &&
            cloned.dates &&
            cloned.dates.length > 0)
        ) {
          const arrSlots = Array.isArray(cloned.slots) ? cloned.slots : [];
          const slotsMap = {};
          if (cloned.dates && cloned.dates.length > 0) {
            cloned.dates.forEach((d) => (slotsMap[d] = arrSlots.slice()));
          } else {
            const today = new Date().toISOString().split("T")[0];
            slotsMap[today] = arrSlots.slice();
            cloned.dates = [today];
          }
          cloned.slots = slotsMap;
        }
        setService(cloned);
        if (cloned.dates && cloned.dates.length > 0)
          setSelectedDate(cloned.dates[0]);
        setLoading(false);
        return;
      }

      setFetchError("No se pudieron obtener los detalles del servicio desde el servidor.");
      setLoading(false);
    }

    tryFetch();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [id]);

  function normalizeToDateString(d) {
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    return dt.toISOString().split("T")[0];
  }

  function sortServiceDates(datesArr) {
    if (!Array.isArray(datesArr)) return [];

    const uniq = Array.from(
      new Set(datesArr.map(normalizeToDateString).filter(Boolean)),
    );

    const parsed = uniq.map((ds) => ({ ds, date: new Date(ds) }));

    const dateVal = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

    const today = new Date();
    const todayVal = dateVal(today);

    const past = parsed
      .filter((p) => dateVal(p.date) < todayVal)
      .sort((a, b) => dateVal(b.date) - dateVal(a.date));

    const future = parsed
      .filter((p) => dateVal(p.date) >= todayVal)
      .sort((a, b) => dateVal(a.date) - dateVal(b.date));

    return [...past, ...future].map((p) => p.ds);
  }

  function transformServiceShape(doc) {
    const out = {};
    out.id =
      doc._id ??
      doc.id ??
      doc.slug ??
      String(doc.name).replace(/\s+/g, "-").toLowerCase();
    out.name = doc.name ?? doc.title ?? "Servicio";
    out.image =
      doc.image || doc.imageUrl || doc.imageURL || doc.image_path || null;
    out.price =
      typeof doc.price === "number" ? doc.price : Number(doc.price) || 0;
    out.about = doc.about ?? doc.description ?? doc.shortDescription ?? "";
    out.instructions = Array.isArray(doc.instructions) ? doc.instructions : [];

    let dates = Array.isArray(doc.dates) ? doc.dates.slice() : [];
    let slotsMap = {};
    if (
      doc.slots &&
      !Array.isArray(doc.slots) &&
      typeof doc.slots === "object"
    ) {
      slotsMap = { ...doc.slots };
      if (dates.length === 0) dates = Object.keys(slotsMap);
    } else if (Array.isArray(doc.slots)) {
      const arr = doc.slots.slice();
      if (dates.length > 0) {
        dates.forEach((d) => (slotsMap[d] = arr.slice()));
      } else {
        const today = new Date().toISOString().split("T")[0];
        slotsMap[today] = arr.slice();
        dates = [today];
      }
    } else {
      if (dates.length > 0) {
        dates.forEach((d) => (slotsMap[d] = []));
      } else {
        const today = new Date().toISOString().split("T")[0];
        dates = [today];
        slotsMap[today] = [];
      }
    }

    out.dates = sortServiceDates(dates);
    out.slots = slotsMap;
    out.imageAlt = doc.imageAlt ?? doc.alt ?? out.name;
    out.raw = doc;
    return out;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const missing = getClientMissingFields();
    if (missing.length > 0) {
      setSubmitError(
        `Falta completar: ${missing.join(", ")}`,
      );
      return;
    }

    if (!service) {
      setSubmitError("No se cargaron los detalles del servicio.");
      return;
    }

    if (!isSignedIn) {
      toast.error("Inicia sesión para realizar una reserva.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken().catch(() => null);

      const payload = {
        serviceId:
          (service?.raw && (service.raw._id || service.raw.id)) || service?.id,
        serviceName: service?.name || "",
        serviceImageUrl:
          (service?.raw &&
            (service.raw.imageUrl ||
              service.raw.image ||
              service.raw.imageURL ||
              "")) ||
          service?.image ||
          "",
        serviceImagePublicId:
          (service?.raw &&
            (service.raw.imagePublicId ||
              (service.raw.image && service.raw.image.publicId) ||
              "")) ||
          "",
        patientName: customerName.trim(),
        mobile: mobile.trim(),
        age: age ? Number(age) : undefined,
        gender: gender || "",
        date: selectedDate,
        time: selectedTime,
        fee: service?.price ?? 0,
        fees: service?.price ?? 0,
        paymentMethod: paymentMethod === "Cash" ? "Cash" : "Online",
        email: email || undefined,
        meta: {
          client: "frontend",
          serviceName: service?.name,
        },
      };

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        toast.error(
          "No se pudo obtener el token de autenticación. Inicia sesión nuevamente.",
        );
        setSubmitting(false);
        return;
      }

      const res = await fetch(`${DEFAULT_HOST}/api/service-appointments`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = { rawText: text };
      }

      if (!res.ok) {
        const msg =
          (json && (json.message || json.error || json.rawText)) ||
          `El servidor respondió con estado ${res.status}`;
        if (json && json.errors && typeof json.errors === "object") {
          const ve = Array.isArray(json.errors)
            ? json.errors.join(", ")
            : JSON.stringify(json.errors);
          setSubmitError(`${msg} — ${ve}`);
        } else {
          setSubmitError(String(msg));
        }
        setSubmitting(false);
        return;
      }

      const { checkoutUrl } = json || {};

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      toast.success(
        "Reserva creada con éxito. Redirigiendo a tus citas...",
      );
      setTimeout(() => {
        navigate("/appointments?payment_status=Paid", { replace: true });
      }, 700);

      setCustomerName("");
      setMobile("");
      setAge("");
      setGender("");
      setSelectedDate("");
      setSelectedTime("");
      setEmail("");
    } catch (err) {
      console.error("Booking submit error:", err);
      setSubmitError("Error de red al crear la reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={serviceDetailStyles.loadingContainer}>
        <div className={serviceDetailStyles.loadingCard}>
          <h2 className={serviceDetailStyles.loadingTitle}>
            Cargando Servicio...
          </h2>
          <p className={serviceDetailStyles.loadingText}>
            Obteniendo detalles del servidor...
          </p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={serviceDetailStyles.loadingContainer}>
        <div className={serviceDetailStyles.loadingCard}>
          <h2 className={serviceDetailStyles.loadingTitle}>
            Servicio no encontrado
          </h2>
          <p className={serviceDetailStyles.loadingText}>
            {fetchError || "Vuelve atrás y selecciona un servicio válido."}
          </p>
          <Link to="/services" className={serviceDetailStyles.backToServices}>
            Volver a Servicios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={serviceDetailStyles.pageContainer}>
      <Toaster />
      <div className={serviceDetailStyles.navBar}>
        <div className={serviceDetailStyles.navContainer}>
          <Link to="/services" className={serviceDetailStyles.backButton}>
            <ArrowLeft size={18} />
            Volver
          </Link>
        </div>
      </div>

      <div className={serviceDetailStyles.mainGrid}>
        {/* IZQUIERDA */}
        <div className={serviceDetailStyles.leftColumn}>
          <div className={serviceDetailStyles.imageContainer}>
            <img
              src={service.image || "/placeholder-service.png"}
              alt={service.name}
              className={serviceDetailStyles.image}
            />
          </div>

          <div className={serviceDetailStyles.detailsContainer}>
            <h3 className={serviceDetailStyles.detailsTitle}>
              <Phone size={20} />
              Tus Datos
            </h3>

            <div className={serviceDetailStyles.detailsGrid}>
              <input
                required
                type="text"
                placeholder="Nombre completo *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={serviceDetailStyles.input}
              />

              <input
                type="text"
                required
                placeholder="Celular (9 dígitos) *"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className={
                  mobile && !isValidMobile(mobile)
                    ? serviceDetailStyles.invalidInput
                    : serviceDetailStyles.input
                }
              />

              <input
                type="number"
                required
                placeholder="Edad *"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={serviceDetailStyles.input}
              />

              <select
                value={gender}
                required
                onChange={(e) => setGender(e.target.value)}
                className={serviceDetailStyles.input}
              >
                <option value="">Seleccionar género *</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>

              <input
                type="email"
                placeholder="Correo electrónico (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={serviceDetailStyles.emailInput}
              />
            </div>

            <div className={serviceDetailStyles.dateSection}>
              <label className={serviceDetailStyles.paymentLabel}>
                Método de Pago
              </label>
              <div className={serviceDetailStyles.paymentOptions}>
                <label
                  className={serviceDetailStyles.paymentOption(
                    paymentMethod === "Cash",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={() => setPaymentMethod("Cash")}
                    className={serviceDetailStyles.paymentInput}
                  />
                  Efectivo
                </label>
                <label
                  className={serviceDetailStyles.paymentOption(
                    paymentMethod === "Online",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Online"
                    checked={paymentMethod === "Online"}
                    onChange={() => setPaymentMethod("Online")}
                    className={serviceDetailStyles.paymentInput}
                  />
                  En línea
                </label>
              </div>
            </div>
          </div>

          {/* FECHA */}
          <div>
            <h2 className={serviceDetailStyles.dateTitle}>Seleccionar Fecha *</h2>
            <div className={serviceDetailStyles.dateScrollContainer}>
              <div className={serviceDetailStyles.dateButtonsContainer}>
                {service.dates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedTime("");
                    }}
                    className={serviceDetailStyles.dateButton(
                      selectedDate === d,
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HORA */}
          {selectedDate && (
            <div className={serviceDetailStyles.timeSection}>
              <h2 className={serviceDetailStyles.timeTitle}>Seleccionar Hora *</h2>
              <div className={serviceDetailStyles.timeScrollContainer}>
                <div className={serviceDetailStyles.timeButtonsContainer}>
                  {(service.slots[selectedDate] || []).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={serviceDetailStyles.timeButton(
                        selectedTime === t,
                      )}
                    >
                      <Clock className={`${iconSize.small} mr-1`} />
                      {t}
                    </button>
                  ))}
                  {(!service.slots[selectedDate] ||
                    service.slots[selectedDate].length === 0) && (
                    <div className={serviceDetailStyles.noSlotsMessage}>
                      No hay horarios disponibles para esta fecha.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            {submitError && (
              <div className={serviceDetailStyles.errorMessage}>
                {submitError}
              </div>
            )}
            {successMessage && (
              <div className={serviceDetailStyles.successMessage}>
                {successMessage}
              </div>
            )}
            <button
              type="button"
              disabled={!isFormValid() || submitting}
              onClick={handleSubmit}
              className={serviceDetailStyles.submitButton(
                isFormValid() && !submitting,
                submitting,
              )}
            >
              <Send />
              {submitting
                ? "Enviando..."
                : `Confirmar Reserva ${
                    service.price ? `• S/ ${service.price}` : ""
                  }`}
            </button>
          </div>
        </div>

        {/* DERECHA */}
        <div className={serviceDetailStyles.rightColumn}>
          <h1 className={serviceDetailStyles.serviceName}>{service.name}</h1>

          <div className={serviceDetailStyles.aboutContainer}>
            <h2 className={serviceDetailStyles.aboutTitle}>
              <FileText /> Acerca de Este Servicio
            </h2>
            <p className={serviceDetailStyles.aboutText}>{service.about}</p>
          </div>

          <div className={serviceDetailStyles.priceContainer}>
            <span className={serviceDetailStyles.priceText}>
              S/ {service.price}
            </span>
          </div>

          <div className={serviceDetailStyles.instructionsContainer}>
            <h3 className={serviceDetailStyles.instructionsTitle}>
              Instrucciones Previas al Examen
            </h3>
            <ul className={serviceDetailStyles.instructionsList}>
              {service.instructions.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>

          <div className={serviceDetailStyles.summaryContainer}>
            <h3 className={serviceDetailStyles.summaryTitle}>
              Resumen de Reserva
            </h3>
            <div className={serviceDetailStyles.summaryContent}>
              <p>
                <b>Nombre:</b> {customerName || "Sin completar"}
              </p>
              <p>
                <b>Celular:</b> {mobile || "Sin completar"}
              </p>
              <p>
                <b>Edad:</b> {age || "Sin completar"}
              </p>
              <p>
                <b>Género:</b> {gender || "Sin completar"}
              </p>
              <p>
                <b>Fecha:</b> {selectedDate || "Sin seleccionar"}
              </p>
              <p>
                <b>Hora:</b> {selectedTime || "Sin seleccionar"}
              </p>
              <p>
                <b>Pago:</b>{" "}
                {paymentMethod === "Cash" ? "Efectivo" : "En línea"}
              </p>
              <p>
                <b>Precio:</b> S/ {service.price}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}