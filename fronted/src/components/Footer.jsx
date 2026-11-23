import React, { useState } from "react";
import { footerStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import {
  Stethoscope,
  Activity,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Send,
} from "lucide-react";

const QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "Doctores", href: "/doctors" },
  { name: "Servicios", href: "/services" },
  { name: "Contacto", href: "/contact" },
  { name: "Citas", href: "/appointments" },
];

const SERVICES = [
  { name: "Control de presion arterial", href: "/services" },
  { name: "Prueba de azucar en sangre", href: "/services" },
  { name: "Hemograma completo", href: "/services" },
  { name: "Tomografia de rayos X", href: "/services" },
  { name: "Prueba de perfil lipidico", href: "/services" },
];

const FacebookIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    Icon: FacebookIcon,
    color: footerStyles.facebookColor,
    name: "Facebook",
    href: "",
  },
  {
    Icon: TwitterIcon,
    color: footerStyles.twitterColor,
    name: "Twitter",
    href: "",
  },
  {
    Icon: InstagramIcon,
    color: footerStyles.instagramColor,
    name: "Instagram",
    href: "",
  },
  {
    Icon: LinkedinIcon,
    color: footerStyles.linkedinColor,
    name: "LinkedIn",
    href: "",
  },
  {
    Icon: YoutubeIcon,
    color: footerStyles.youtubeColor,
    name: "YouTube",
    href: "",
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className={footerStyles.footerContainer}>
      <div className={footerStyles.floatingIcon1}>
        <Stethoscope className={footerStyles.stethoscopeIcon} />
      </div>
      <div
        className={footerStyles.floatingIcon2}
        style={{
          animationDelay: "3s",
        }}
      >
        <Activity className={footerStyles.activityIcon} />
      </div>

      <div className={footerStyles.mainContent}>
        <div className={footerStyles.gridContainer}>
          <div className={footerStyles.companySection}>
            <div className={footerStyles.logoContainer}>
              <div className={footerStyles.logoWrapper}>
                <div className={footerStyles.logoImageContainer}>
                  <img
                    src={logo}
                    alt="MediCare logo"
                    className={footerStyles.logoImage}
                  />
                </div>
              </div>

              <div>
                <h2 className={footerStyles.companyName}>MediCare</h2>
                <p className={footerStyles.companyTagline}>
                  Soluciones Sanitarias
                </p>
              </div>
            </div>

            <p className={footerStyles.companyDescription}>
              Su socio de confianza en innovación sanitaria. Nos comprometemos a
              brindar una atención médica excepcional con tecnología de
              vanguardia y un servicio compasivo.
            </p>
            <div className={footerStyles.contactContainer}>
              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <Phone className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>+51 987345251</span>
              </div>

              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <Mail className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>
                  MediCare@gmail.com
                </span>
              </div>

              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <MapPin className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>Huánuco, Perú</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.sectionTitle}>Enlaces Rápidos</h3>
            <ul className={footerStyles.linksList}>
              {QUICK_LINKS.map((link, index) => (
                <li key={link.name} className={footerStyles.linkItem}>
                  <a
                    href={link.href}
                    className={footerStyles.quickLink}
                    style={{
                      animationDelay: `${index * 60}ms`,
                    }}
                  >
                    <div className={footerStyles.quickLinkIconWrapper}>
                      <ArrowRight className={footerStyles.quickLinkIcon} />
                    </div>
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Nuestros servicios */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.sectionTitle}>Nuestros Servicios</h3>
            <ul className={footerStyles.linksList}>
              {SERVICES.map((service, index) => (
                <li key={`${service.name}-${index}`}>
                  <a href={service.href} className={footerStyles.serviceLink}>
                    <div className={footerStyles.serviceIcon} />
                    <span>{service.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className={footerStyles.newsletterSection}>
            <h3 className={footerStyles.newsletterTitle}>Mantente Conectado</h3>
            <p className={footerStyles.newsletterDescription}>
              Suscribete para recibir consejos de salud, actualizaciones medicas
              e informacion sobre bienestar directamente en tu correo
              electronico.
            </p>

            {/* Newsletter form */}
            <form
              onSubmit={handleSubscribe}
              className={footerStyles.newsletterForm}
            >
              <div className={footerStyles.mobileNewsletterContainer}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={footerStyles.emailInput}
                />
                <button
                  type="submit"
                  className={footerStyles.mobileSubscribeButton}
                >
                  <Send className={footerStyles.mobileButtonIcon} />
                  Subscribe
                </button>
              </div>

              {/* Desktop newsletter */}
              <div className={footerStyles.desktopNewsletterContainer}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo"
                  className={footerStyles.desktopEmailInput}
                />
                <button
                  type="submit"
                  className={footerStyles.desktopSubscribeButton}
                >
                  <Send className={footerStyles.desktopButtonIcon} />
                  <span className={footerStyles.desktopButtonText}>
                    Suscribete
                  </span>
                </button>
              </div>

              {subscribed && (
                <p className="text-xs text-emerald-600 mt-2">
                  ¡Gracias por suscribirte!
                </p>
              )}

              {/* Social icons */}
              <div className={footerStyles.socialContainer}>
                {SOCIAL_LINKS.map(({ Icon, color, name, href }, index) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    title={name}
                    className={footerStyles.socialLink}
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className={footerStyles.socialIconBackground} />
                    <Icon className={`${footerStyles.socialIcon} ${color}`} />
                  </a>
                ))}
              </div>
            </form>
          </div>
        </div>

        <div className={footerStyles.bottomSection}>
          <div className={footerStyles.copyright}>
            <span>&copy; {currentYear} Medicare Clinica Medica</span>
          </div>

          <div className={footerStyles.designerText}>
            <span>Diseñado por </span>
            <span className={footerStyles.designerLink}>Juan Ampudia Pozo</span>
          </div>
        </div>
      </div>

      <style>{footerStyles.animationStyles}</style>
    </footer>
  );
};

export default Footer;
