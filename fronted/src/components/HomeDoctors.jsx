import React, { useCallback, useEffect, useState } from "react";
import { homeDoctorsStyles, iconSize } from "../assets/dummyStyles";
import { Link } from "react-router-dom";
import { ChevronRight, Medal, MousePointer2Off } from "lucide-react";

const API_BASE = "http://localhost:4000";

function normalizeDoctorsList(items) {
  return (Array.isArray(items) ? items : []).map((d) => {
    const id = d._id || d.id;
    const image = d.imageUrl || d.image || d.imageSmall || d.imageSrc || "";
    const available =
      (typeof d.availability === "string"
        ? d.availability.toLowerCase() === "available"
        : typeof d.available === "boolean"
          ? d.available
          : d.availability === true) || d.availability === "Available";
    return {
      id,
      name: d.name || "Unknown",
      specialization: d.specialization || "",
      image,
      experience:
        d.experience || d.experience === 0 ? String(d.experience) : "",
      fee: d.fee ?? d.price ?? 0,
      available,
      raw: d,
    };
  });
}

const HomeDoctors = ({ previewCount = 8 }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDoctors = useCallback(async (isMountedRef) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (json && json.message) || `Failed to load doctors (${res.status})`;
        if (isMountedRef && !isMountedRef.current) return;
        setError(msg);
        setDoctors([]);
        return;
      }

      const items = (json && (json.data || json)) || [];
      const normalized = normalizeDoctorsList(items);

      if (isMountedRef && !isMountedRef.current) return;
      setDoctors(normalized);
    } catch (err) {
      if (isMountedRef && !isMountedRef.current) return;
      console.error("load doctors error:", err);
      setError("Error de red al cargar los doctores.");
      setDoctors([]);
    } finally {
      if (!isMountedRef || isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const mountedRef = { current: true };
    loadDoctors(mountedRef);
    return () => {
      mountedRef.current = false;
    };
  }, [loadDoctors]);

  const preview = doctors.slice(0, previewCount);

  return (
    <section className={homeDoctorsStyles.section}>
      <div className={homeDoctorsStyles.container}>
        <div className={homeDoctorsStyles.header}>
          <h1 className={homeDoctorsStyles.title}>
            Nuestro{" "}
            <span className={homeDoctorsStyles.titleSpan}>Equipo Médico</span>
          </h1>
          <p className={homeDoctorsStyles.subtitle}>
            Reserva citas rápidamente con nuestros especialistas verificados
          </p>
        </div>

        {/* error */}
        {error ? (
          <div className={homeDoctorsStyles.errorContainer}>
            <div className={homeDoctorsStyles.errorText}>{error}</div>
            <button
              type="button"
              onClick={() => loadDoctors(null)}
              className={homeDoctorsStyles.retryButton}
            >
              Reintentar
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className={homeDoctorsStyles.skeletonGrid}>
            {Array.from({ length: previewCount }).map((_, i) => (
              <div key={i} className={homeDoctorsStyles.skeletonCard}>
                <div className={homeDoctorsStyles.skeletonImage} />
                <div className={homeDoctorsStyles.skeletonText1} />
                <div className={homeDoctorsStyles.skeletonText2} />
                <div className="flex gap-2 mt-auto">
                  <div className={homeDoctorsStyles.skeletonButton} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={homeDoctorsStyles.doctorsGrid}>
            {preview.map((doctor) => (
              <article
                key={doctor.id || doctor.name}
                className={homeDoctorsStyles.article}
              >
                {doctor.available ? (
                  <Link
                    to={`/doctors/${doctor.id}`}
                    state={{
                      doctor: doctor.raw || doctor,
                    }}
                  >
                    <div className={homeDoctorsStyles.imageContainerAvailable}>
                      <img
                        src={doctor.image || "/placeholder-doctor.jpg"}
                        alt={doctor.name}
                        loading="lazy"
                        className={homeDoctorsStyles.image}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholder-doctor.jpg";
                        }}
                      />
                    </div>
                  </Link>
                ) : (
                  <div className={homeDoctorsStyles.imageContainerUnavailable}>
                    <img
                      src={doctor.image || "/placeholder-doctor.jpg"}
                      alt={doctor.name}
                      loading="lazy"
                      className={homeDoctorsStyles.image}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-doctor.jpg";
                      }}
                    />
                    <div className={homeDoctorsStyles.unavailableBadge}>
                      No Disponible
                    </div>
                  </div>
                )}

                {/* body */}
                <div className={homeDoctorsStyles.cardBody}>
                  <h3
                    className={homeDoctorsStyles.doctorName}
                    id={`doctor-${doctor.id}-name`}
                  >
                    {doctor.name}
                  </h3>
                  <p className={homeDoctorsStyles.specialization}>
                    {doctor.specialization}
                  </p>
                  <div className={homeDoctorsStyles.experienceContainer}>
                    <div className={homeDoctorsStyles.experienceBadge}>
                      <Medal className={`${iconSize.small} h-4`} />
                      <span>{doctor.experience} Años de Experiencia</span>
                    </div>
                  </div>
                  <div className={homeDoctorsStyles.buttonContainer}>
                    <div className="w-full">
                      {doctor.available ? (
                        <Link
                          to={`/doctors/${doctor.id}`}
                          state={{
                            doctor: doctor.raw || doctor,
                          }}
                          className={homeDoctorsStyles.buttonAvailable}
                        >
                          <ChevronRight className="w-5 h-5" />
                          Reserva Ahora
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className={homeDoctorsStyles.buttonUnavailable}
                        >
                          <MousePointer2Off className="w-5 h-5" />
                          No Disponible
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <style>{homeDoctorsStyles.customCSS}</style>
    </section>
  );
};

export default HomeDoctors;