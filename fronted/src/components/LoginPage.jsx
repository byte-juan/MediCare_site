import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { loginPageStyles, toastStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";

const STORAGE_KEY = "doctorToken_v1";
const DOCTOR_ID_KEY = "doctorId_v1";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      toast.error("Todos los campos son requeridos", {
        style: toastStyles.errorToast,
      });
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(json?.message || "Error al iniciar sesión", {
          style: toastStyles.errorToast,
          duration: 4000,
        });
        setBusy(false);
        return;
      }

      const token = json?.token || json?.data?.token;
      if (!token) {
        toast.error("No se recibió el token de autenticación", {
          style: toastStyles.errorToast,
        });
        setBusy(false);
        return;
      }

      const doctorId =
        json?.data?._id ||
        json?.data?.id ||
        json?.doctor?._id ||
        json?.doctor?.id ||
        json?.data?.doctor?._id;

      if (!doctorId) {
        toast.error("No se encontró el ID del doctor en la respuesta del servidor", {
          style: toastStyles.errorToast,
        });
        setBusy(false);
        return;
      }

      localStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem(DOCTOR_ID_KEY, String(doctorId));
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: token })
      );

      toast.success("Inicio de sesión exitoso — redirigiendo...", {
        style: toastStyles.successToast,
      });

      setTimeout(() => {
        navigate(`/doctor-admin/${doctorId}`);
      }, 700);
    } catch (err) {
      console.error("login error:", err);
      toast.error("Error de red al intentar iniciar sesión", {
        style: toastStyles.errorToast,
      });
      setBusy(false);
    }
  };

  return (
    <div className={loginPageStyles.mainContainer}>
      <Toaster position="top-right" reverseOrder={false} />
      <button
        type="button"
        onClick={() => navigate("/")}
        className={loginPageStyles.backButton}
      >
        <ArrowLeft className={loginPageStyles.backButtonIcon} />
        Volver al Menú
      </button>

      <div className={loginPageStyles.loginCard}>
        <div className={loginPageStyles.logoContainer}>
          <img src={logo} alt="MediCare logo" className={loginPageStyles.logo} />
        </div>
        <h2 className={loginPageStyles.title}>Doctor Admin</h2>
        <p className={loginPageStyles.subtitle}>
          Inicia sesión para gestionar tu perfil y horario
        </p>
        <form onSubmit={handleLogin} className={loginPageStyles.form}>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Dirección de correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className={loginPageStyles.input}
            required
          />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className={loginPageStyles.input}
            required
          />

          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className={loginPageStyles.submitButton}
          >
            {busy ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;