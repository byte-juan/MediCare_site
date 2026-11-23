import React, { useState } from "react";
import { contactPageStyles } from "../assets/dummyStyles";
import {
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  SendHorizonal,
  Stethoscope,
  User,
} from "lucide-react";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  department: "",
  service: "",
  message: "",
};

const DEPARTMENTS = [
  "Médico general",
  "Cardiología",
  "Ortopedia",
  "Dermatología",
  "Pediatría",
  "Ginecología",
];

const SERVICES_MAPPING = {
  "Médico general": [
    "Consulta general",
    "Chequeo médico",
    "Vacunación",
    "Tamizaje preventivo",
  ],
  Cardiología: [
    "Electrocardiograma (ECG)",
    "Ecocardiografía",
    "Prueba de esfuerzo",
    "Consulta cardiológica",
  ],
  Ortopedia: [
    "Atención de fracturas",
    "Consulta por dolor articular",
    "Fisioterapia",
  ],
  Dermatología: [
    "Consulta dermatológica",
    "Prueba de alergia",
    "Tratamiento de acné",
  ],
  Pediatría: [
    "Control pediátrico",
    "Vacunación infantil",
    "Control de crecimiento",
  ],
  Ginecología: [
    "Control prenatal",
    "Papanicolaou",
    "Ecografía obstétrica/ginecológica",
  ],
};

const GENERIC_SERVICES = [
  "Consulta general",
  "Electrocardiograma (ECG)",
  "Análisis de sangre",
  "Rayos X",
  "Ecografía",
  "Fisioterapia",
  "Vacunación",
];

const ContactPage = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre completo es obligatorio";
    if (!form.email.trim()) e.email = "El correo electrónico es obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Ingresa un correo electrónico válido";

    if (!form.phone.trim()) e.phone = "El número telefónico es obligatorio";
    else if (!/^[0-9]{9}$/.test(form.phone))
      e.phone = "El número de teléfono debe tener exactamente 9 dígitos";

    if (!form.department && !form.service) {
      e.department = "Selecciona un departamento o un servicio";
      e.service = "Selecciona un departamento o un servicio";
    }

    if (!form.message.trim())
      e.message = "Por favor escribe un mensaje breve";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "department") {
      setForm((prev) => ({ ...prev, department: value, service: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => {
      const next = { ...prev, [name]: undefined };
      if (name === "department" || name === "service") {
        const hasDept = name === "department" ? Boolean(value) : Boolean(form.department);
        const hasSvc = name === "service" ? Boolean(value) : Boolean(form.service);
        if (hasDept || hasSvc) {
          delete next.department;
          delete next.service;
        }
      }
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const text = `*Solicitud de Contacto - MediCare*\nNombre: ${form.name}\nCorreo: ${form.email}\nTeléfono: ${form.phone}\nDepartamento: ${
      form.department || "No especificado"
    }\nServicio: ${form.service || "No especificado"}\nMensaje: ${form.message}`;

    const url = `https://wa.me/51958662651?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    setForm(INITIAL_FORM);
    setErrors({});
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  const availableServices = form.department
    ? SERVICES_MAPPING[form.department] || GENERIC_SERVICES
    : GENERIC_SERVICES;

  return (
    <div className={contactPageStyles.pageContainer}>
      <div className={contactPageStyles.bgAccent1}></div>
      <div className={contactPageStyles.bgAccent2}></div>

      <div className={contactPageStyles.gridContainer}>
        <div className={contactPageStyles.formContainer}>
          <h2 className={contactPageStyles.formTitle}>
            Contacta con nuestra Clínica
          </h2>
          <p className={contactPageStyles.formSubtitle}>
            Completa el formulario y se abrirá WhatsApp para comunicarte con
            nosotros al instante.
          </p>

          <form onSubmit={handleSubmit} className={contactPageStyles.formSpace}>
            <div className={contactPageStyles.formGrid}>
              <div>
                <label className={contactPageStyles.label}>
                  <User size={16} /> Nombre Completo
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nombre Completo"
                  className={contactPageStyles.input}
                />
                {errors.name && (
                  <p className={contactPageStyles.error}>{errors.name}</p>
                )}
              </div>

              <div>
                <label className={contactPageStyles.label}>
                  <Mail size={16} /> Correo
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Correo Electrónico"
                  className={contactPageStyles.input}
                />
                {errors.email && (
                  <p className={contactPageStyles.error}>{errors.email}</p>
                )}
              </div>
            </div>

            <div className={contactPageStyles.formGrid}>
              <div>
                <label className={contactPageStyles.label}>
                  <Phone size={16} /> Teléfono
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="987654321"
                  className={contactPageStyles.input}
                  maxLength={9}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className={contactPageStyles.error}>{errors.phone}</p>
                )}
              </div>

              <div>
                <label className={contactPageStyles.label}>
                  <MapPin size={16} /> Departamento
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={contactPageStyles.input}
                >
                  <option value="">Selecciona un departamento</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className={contactPageStyles.error}>{errors.department}</p>
                )}
              </div>
            </div>

            <div>
              <label className={contactPageStyles.label}>
                <Stethoscope size={16} /> Servicio
              </label>
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className={contactPageStyles.input}
              >
                <option value="">
                  Selecciona un servicio (o elige un departamento arriba)
                </option>
                {availableServices.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className={contactPageStyles.error}>{errors.service}</p>
              )}
            </div>

            <div>
              <label className={contactPageStyles.label}>
                <MessageSquare size={16} /> Mensaje
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe brevemente tu consulta o preocupación..."
                rows={4}
                className={contactPageStyles.textarea}
              />
              {errors.message && (
                <p className={contactPageStyles.error}>{errors.message}</p>
              )}
            </div>

            <div className={contactPageStyles.buttonContainer}>
              <button type="submit" className={contactPageStyles.button}>
                <SendHorizonal size={18} /> <span>Enviar por WhatsApp</span>
              </button>

              {sent && (
                <p className={contactPageStyles.sentMessage}>
                  Abriendo WhatsApp y limpiando el formulario...
                </p>
              )}
            </div>
          </form>
        </div>

        <div className={contactPageStyles.infoContainer}>
          <div className={contactPageStyles.infoCard}>
            <h3 className={contactPageStyles.infoTitle}>
              Visita Nuestra Clínica
            </h3>
            <p className={contactPageStyles.infoText}>Huánuco, Perú</p>
            <p className={contactPageStyles.infoItem}>
              <Phone size={16} /> +51 987 345 251
            </p>
            <p className={contactPageStyles.infoItem}>
              <Mail size={16} /> info@MediCare.com
            </p>
          </div>

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7860.0578292677255!2d-76.23789071006473!3d-9.931549873515348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91a7c300fd9e2f67%3A0xd212b736fa2bc7d!2sHOSPITAL%20REGIONAL%20HERMILIO%20VALDIZAN%20MEDRANO!5e0!3m2!1ses-419!2spe!4v1795400877926!5m2!1ses-419!2spe"
            className={contactPageStyles.map}
            title="Hospital Regional Hermilio Valdizán Medrano - Huánuco"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          ></iframe>

          <div className={contactPageStyles.hoursContainer}>
            <h4 className={contactPageStyles.hoursTitle}>
              Horario de la Clínica
            </h4>
            <p className={contactPageStyles.hoursText}>
              Lunes - Sábado: 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>
      </div>

      <style>{contactPageStyles.animationKeyframes}</style>
    </div>
  );
};

export default ContactPage;