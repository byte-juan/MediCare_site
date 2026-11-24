import React, { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { Calendar, Edit, Home, LogOut, Menu, X } from "lucide-react";
import { navbarStylesDr } from "../assets/dummyStyles";
import logo from "../assets/logo.png";

const STORAGE_KEY = "doctorToken_v1";
const DOCTOR_ID_KEY = "doctorId_v1";

const DoctorNavbar = () => {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const doctorId = useMemo(() => {
    if (params?.id) return params.id;
    const match = location.pathname.match(/\/doctor-admin\/([^/]+)/);
    return match ? match[1] : null;
  }, [params, location.pathname]);

  const basePath = doctorId
    ? `/doctor-admin/${doctorId}`
    : "/doctor-admin/login";

  const navItems = [
    { name: "Dashboard", to: `${basePath}`, Icon: Home },
    { name: "Citas", to: `${basePath}/appointments`, Icon: Calendar },
    { name: "Editar Perfil", to: `${basePath}/profile/edit`, Icon: Edit },
  ];

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DOCTOR_ID_KEY);
    navigate("/doctor-admin/login", { replace: true });
  };

  return (
    <>
      <nav className={navbarStylesDr.navContainer}>
        <div className={navbarStylesDr.leftBrand}>
          <div className={navbarStylesDr.logoContainer}>
            <img src={logo} alt="MediCare logo" className={navbarStylesDr.logoImage} />
          </div>

          <div className={navbarStylesDr.brandTextContainer}>
            <div className={navbarStylesDr.brandTitle}>MediCare</div>
            <div className={navbarStylesDr.brandSubtitle}>
              Soluciones Sanitarias
            </div>
          </div>
        </div>

        {/* Navegación escritorio */}
        <div className={navbarStylesDr.desktopMenu}>
          <div className={navbarStylesDr.desktopMenuItems}>
            {navItems.map(({ name, to, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === basePath}
                className={({ isActive }) =>
                  `${navbarStylesDr.baseLink} ${
                    isActive
                      ? navbarStylesDr.activeLink
                      : navbarStylesDr.inactiveLink
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <span className={navbarStylesDr.linkContent}>
                  <Icon size={16} className={navbarStylesDr.linkIcon} />
                  <span className={navbarStylesDr.linkText}>{name}</span>
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className={navbarStylesDr.rightActions}>
          <button
            type="button"
            onClick={handleLogout}
            className={navbarStylesDr.logoutButtonDesktop}
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>

          {/* Botones hamburguesa */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={navbarStylesDr.hamburgerButtonMd}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={navbarStylesDr.hamburgerButtonLg}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      <div className={navbarStylesDr.mobileMenuContainer(open)}>
        <div className={navbarStylesDr.mobileMenuItems || ""}>
          {navItems.map(({ name, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === basePath}
              className={({ isActive }) =>
                `${navbarStylesDr.mobileBaseLink} ${
                  isActive
                    ? navbarStylesDr.mobileActiveLink
                    : navbarStylesDr.mobileInactiveLink
                }`
              }
              onClick={() => setOpen(false)}
            >
              <Icon size={18} className="text-emerald-400" />
              <span>{name}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className={navbarStylesDr.mobileLogoutButton}
          >
            <div className={navbarStylesDr.mobileLogoutContent}>
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </div>

      <div className={navbarStylesDr.spacer}></div>
    </>
  );
};

export default DoctorNavbar;