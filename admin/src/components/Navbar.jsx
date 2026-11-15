import React, { useState, useRef, useEffect,useCallback,useLayoutEffect } from 'react';
import { navbarStyles as ns } from '../assets/dummyStyles';
import logoImg from '../assets/logo.png';
import { useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import { 
  Home, 
  UserPlus, 
  Users, 
  Calendar, 
  Grid, 
  PlusSquare, 
  List, 
  Menu
} from 'lucide-react';
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navInnerRef = useRef(null);
  const indicatorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  /// clerk
const clerk = useClerk();
const { getToken, isLoaded: authLoaded } = useAuth();
const { isSignedIn, user, isLoaded: userLoaded } = useUser();

//INDICADOR ACTIVO DESLIZANTE
 const moveIndicator = useCallback(() => {
    const container = navInnerRef.current;
    const ind = indicatorRef.current;
    if (!container || !ind) return;

    const active = container.querySelector(".nav-item.active");
    if (!active) {
      ind.style.opacity = "0";
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const left = activeRect.left - containerRect.left + container.scrollLeft;
    const width = activeRect.width;

    ind.style.transform = `translateX(${left}px)`;
    ind.style.width = `${width}px`;
    ind.style.opacity = "1";
  }, []);

  // se movera en 0.12 segundos
  useLayoutEffect(() => {
    moveIndicator();
    const t = setTimeout(() => {
      moveIndicator();
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname, moveIndicator]);

  // Ayuda a desplazar en el eje x
  useEffect(() => {
    const container = navInnerRef.current;
    if (!container) return;

    const onScroll = () => {
      moveIndicator();
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      moveIndicator();
    });
    ro.observe(container);
    if (container.parentElement) ro.observe(container.parentElement);

    window.addEventListener("resize", moveIndicator);

    moveIndicator();

    return () => {
      container.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", moveIndicator);
    };
  }, [moveIndicator]);

  //alternara el menu móvil, es decir, se cerrara cuando hagamos clic en Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  
  // Cuando un usuario inicie sesion, se obtiene un TOKEN y se guarda en el LOCALSTORAGE
  useEffect(() => {
    let mounted = true;
    const storeToken = async() => {
      if(!authLoaded || !userLoaded) return;
      if(!isSignedIn) {
        try {
          localStorage.removeItem("clerk_token")
        } catch (error) {
          // ignorar cualquier error
        }
        return;
      }

      try  {
        const token = await getToken();
        if(token) {
          try {
            localStorage.setItem("clerk_token", token);

          } catch (e) {
            
          }
        }
      } catch (err) {
        console.warn("No se puede recuperar el Clerk Token", err)
      }
    }
    storeToken();
    return () => {
      mounted = false;
    };
  }, [isSignedIn, authLoaded, userLoaded, getToken]);

  // para abrir el menu de login Clerk
  const handleOpenSingIn = () => {
    if(!clerk || !clerk.openSignIn) {
      console.warn("Clerk no esta disponible");
      return;
    }  
    clerk.openSignIn();
    navigate("/h");
  };

  // para Cerrar Session
  const handleSingOut = async () => {
      if(!clerk || !clerk.signOut) {
      console.warn("Clerk no esta disponible");
      return;
    }
    try{
      await clerk.signOut();
    } catch (err) {
      console.error("Fallo de cierre de session", err);
    } finally {
      try {
      localStorage.removeItem("clerk_token");
    }
    catch(e) {
      // ignorar
    }
    navigate("/");
  }
  };

  return (
    <header className={ns.header}>
      <nav className={ns.navContainer}>
        <div className={ns.flexContainer}>
          <div className={ns.logoContainer}>
            <img src={logoImg} alt="logo" className={ns.logoImage} />

            <Link to="/">
              <div className={ns.logoLink}>MediCare</div>
              <div className={ns.logoSubtext}>Clinica Medica</div>
            </Link>
          </div>

          {/* center navigation */}
          <div className={ns.centerNavContainer}>
            <div className={ns.glowEffect}>
              <div className={ns.centerNavInner}>
                <div 
                  ref={navInnerRef} 
                  tabIndex={0} 
                  className={ns.centerNavScrollContainer}
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <CenterNavItem to="/" label="Dashboard" icon={<Home size={16} />} />
                  <CenterNavItem to="/add" label="Add Doctor" icon={<UserPlus size={16} />} />
                  <CenterNavItem to="/list" label="List Doctors" icon={<Users size={16} />} />
                  <CenterNavItem to="/appointments" label="Appointments" icon={<Calendar size={16} />} />
                  <CenterNavItem to="/service-dashboard" label="Service Dashboard" icon={<Grid size={16} />} />
                  <CenterNavItem to="/add-service" label="Add Service" icon={<PlusSquare size={16} />} />
                  <CenterNavItem to="/list-service" label="List Services" icon={<List size={16} />} />
                  <CenterNavItem to="/service-appointments" label="Service Appointments" icon={<Calendar size={16} />} />
                </div>
              </div>
            </div>
          </div>

          {/* right side */}
          <div className={ns.rightContainer}>
            {/* auth */}
              {isSignedIn ? (
                <button onClick={handleSignOut} className={ns.signOutButton + " " + ns.cursorPointer}>
                  Cerrar Sesion
                </button>
              ) : (
                <div className=' hidden lg:flex items-center gap-2'>
                  <button onClick={handleOpenSingIn}
                  className={ns.loginButton + " " + ns.cursorPointer}
                  >
                    Login
                  </button>
                </div>
              )}

              {/* mobile vista */}
              <button onClick={() => setOpen((v) => !v)} className={ns.mobileMenuButton}>
                {open ? <x size={18}/> : <Menu size={18} />}
              </button>
          </div>
        </div>

        {/* navegacion mobile */}
        {open && (
          <div className={ns.mobileOverlay} onClick={() => setOpen(false)}/>
        )}
        {open && (
          <div className={ns.mobileMenuContainer} id='mobile-menu'>
            <div className={ns.mobileMenuInner}>

               <MobileItem
                to="/h"
                label="Dashboard"
                icon={<Home size={16} />}
                onClick={() => setOpen(false)}
              />

              <MobileItem
                to="/add"
                label="Add Doctor"
                icon={<UserPlus size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/list"
                label="List Doctors"
                icon={<Users size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/appointments"
                label="Appointments"
                icon={<Calendar size={16} />}
                onClick={() => setOpen(false)}
              />

              <MobileItem
                to="/service-dashboard"
                label="Service Dashboard"
                icon={<Grid size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/add-service"
                label="Add Service"
                icon={<PlusSquare size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/list-service"
                label="List Services"
                icon={<List size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/service-appointments"
                label="Service Appointments"
                icon={<Calendar size={16} />}
                onClick={() => setOpen(false)}
              />

              <div className={ns.mobileAuthContainer}>
                {isSignedIn ? (
                  <button onClick={() => {
                    handleSingOut();
                    setOpen(false);
                  }} className={ns.mobileSignOutButton}>
                      Cerrar Session
                  </button>
                ) : (
                  <div className=" space -y-2">
                    <button onClick={() => {
                      handleOpenSingIn();
                      setOpen(false);
                    }} className={ns.mobileLoginButton + " " + ns.cursorPointer}>
                      Login
                    </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

function CenterNavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""} ${ns.centerNavItemBase} ${
          isActive ? ns.centerNavItemActive : ns.centerNavItemActive
        }`
      }
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

function MobileItem ({to, icon, label, onClick}) {
  return (
    <NavLink to={to} onClick={onClick} className={({isActive}) =>
    `${ns.mobileItemBase} ${
      isActive ? ns.mobileItemActive : ns.mobileItemInactive
    }`}
    >
      {icon}
      <span className='font-medium text -sm'>{label}</span>
    </NavLink> 
  )
}