import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronsRight, MousePointer2Off } from "lucide-react";
import { servicePageStyles, serviceCardStyles } from "../assets/dummyStyles";

const PlaceholderImg = "/placeholder-service.jpg";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const ServiceCard = ({ service }) => {
  const hasSrcSet =
    !!service.imageSrcSet ||
    (!!service.imageSmall && !!service.imageMedium && !!service.imageLarge);

  const src = service.imageUrl || service.image || service.imageSmall || "";
  const srcSet =
    service.imageSrcSet ||
    (service.imageSmall || service.image
      ? `${service.imageSmall || src} 480w, ${
          service.imageMedium || src
        } 768w, ${service.imageLarge || src} 1200w`
      : null);

  const name = service.name || "Servicio";
  const shortDescription = service.shortDescription || service.about || "";

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PlaceholderImg;
  };

  return (
    <div className={serviceCardStyles.card}>
      <div className={serviceCardStyles.imageContainer} aria-hidden="true">
        {hasSrcSet ? (
          <picture className={serviceCardStyles.picture}>
            {service.imageWebp && (
              <source srcSet={service.imageWebp} type="image/webp" />
            )}
            <img
              src={src || PlaceholderImg}
              srcSet={service.imageSrcSet || srcSet || undefined}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              alt={name}
              loading="lazy"
              decoding="async"
              className={serviceCardStyles.responsiveImage}
              onError={handleImgError}
            />
          </picture>
        ) : (
          <img
            src={src || PlaceholderImg}
            alt={name}
            loading="lazy"
            decoding="async"
            className={serviceCardStyles.fallbackImage}
            onError={handleImgError}
          />
        )}
      </div>

      <div className={serviceCardStyles.content}>
        <h3 className={serviceCardStyles.serviceName}>{name}</h3>
        {shortDescription && (
          <p className={serviceCardStyles.shortDescription || ""}>
            {shortDescription}
          </p>
        )}

        <div className={serviceCardStyles.buttonContainer}>
          {service.available ? (
            <Link
              to={`/services/${service.id}`}
              state={{ service: service.raw || service }}
              className={serviceCardStyles.buttonAvailable}
              aria-label={`Reservar ${name}`}
            >
              <ChevronsRight className="w-5 h-5" aria-hidden="true" />
              Reservar ahora
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={serviceCardStyles.buttonUnavailable}
              aria-label={`${name} no disponible`}
            >
              <MousePointer2Off className="w-5 h-5" aria-hidden="true" />
              No disponible
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ServicePage = ({ previewCount = 9999 }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/services`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (json && json.message) ||
          `Error al cargar los servicios (${res.status})`;
        setError(msg);
        setServices([]);
        setLoading(false);
        return;
      }

      const items = (json && (json.data || json.services || json)) || [];
      const normalized = (Array.isArray(items) ? items : []).map((s) => {
        const id = s._id || s.id;
        const image = s.imageUrl || s.image || s.imageSmall || "";
        const available =
          typeof s.available === "boolean"
            ? s.available
            : typeof s.availability === "string"
              ? s.availability.toLowerCase() === "available"
              : s.availability === "Available" || s.available === true;

        return {
          id,
          name: s.name || "Servicio",
          shortDescription: s.shortDescription || s.about || "",
          image,
          imageSmall: s.imageSmall || null,
          imageMedium: s.imageMedium || null,
          imageLarge: s.imageLarge || null,
          imageSrcSet: s.imageSrcSet || null,
          imageWebp: s.imageWebp || null,
          price: s.price ?? s.fee ?? 0,
          available,
          raw: s,
        };
      });

      setServices(normalized);
    } catch (err) {
      console.error("load services error:", err);
      setError("Error de red al cargar los servicios.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const shown = services.slice(0, previewCount);

  return (
    <div className={servicePageStyles.pageContainer}>
      <div className={servicePageStyles.maxWidthContainer}>
        <header className={servicePageStyles.header}>
          <h1 className={servicePageStyles.title}>
            Nuestros Servicios de Diagnóstico
          </h1>
          <p className={servicePageStyles.subtitle}>
            Pruebas seguras, precisas y fiables.
          </p>
        </header>

        {error && (
          <div className={servicePageStyles.errorContainer}>
            <div className={servicePageStyles.errorText}>{error}</div>
            <button
              type="button"
              onClick={loadServices}
              className={servicePageStyles.retryButton}
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <section className={servicePageStyles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={servicePageStyles.skeletonCard}>
                <div className={servicePageStyles.skeletonImage}></div>
                <div className={servicePageStyles.skeletonText1}></div>
                <div className={servicePageStyles.skeletonText2}></div>
                <div className={servicePageStyles.skeletonButton}></div>
              </div>
            ))}
          </section>
        ) : (
          <section className={servicePageStyles.servicesGrid}>
            {shown.length > 0 ? (
              shown.map((s) => <ServiceCard key={s.id || s.name} service={s} />)
            ) : (
              <div className={servicePageStyles.emptyState}>
                No hay servicios disponibles.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ServicePage;