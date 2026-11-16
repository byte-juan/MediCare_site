import React from 'react';
import Navbar from '../components/Navbar';
import { heroStyles } from '../assets/dummyStyles.js';
import logoImg from '../assets/logo.png'; // Corregido de logoIgm a logoImg (opcional pero limpio)

const Hero = ({role = "admin", userName = "Doctor"}) => {

  const isDoctor = role === "doctor";

  return (
    <div className={heroStyles.container}> 
      <Navbar />
      <main className={heroStyles.mainContainer}>
        <section className={heroStyles.section}>
          <div className={heroStyles.decorativeBg.container}>
            <div className={heroStyles.decorativeBg.blurBackground}>
              <div className={heroStyles.decorativeBg.blurShape}></div>
            </div>
            
            <div className={heroStyles.contentBox}>
              <div className={heroStyles.logoContainer}>
                <img src={logoImg} alt="logo" className={heroStyles.logo} />
              </div>

              <h1 className={heroStyles.heading}>
                {/* CORREGIDO: Usar backticks (``) en lugar de comillas simples ('') */}
                {isDoctor ? `Bienvenido, Dr. ${userName}` :
                "BIENVENIDO AL PANEL DE ADMINISTRADOR DE MEDICARE"}
              </h1>

              <p className={heroStyles.description}>
                {isDoctor ? "Acceda a los historiales de sus pacientes, gestione las citas y revise los informes médicos de forma segura desde su panel de control."
                : "Gestione las operaciones del hospital, los médicos, el personal, los historiales de los pacientes y la configuración del sistema desde un panel de control centralizado."
                  } 
              </p>
              {/* INFO CARDS */}
              <div className={heroStyles.infoCards.container}>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Acceso Seguro
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Inicio de sesión basado en roles con datos médicos protegidos
                  </p>
                </div>

                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Gestion en Tiempo Real
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Monitoriar la actividad del hospital y el flujo de pacientes
                  </p>
                </div>

                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Medical Dashboard
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Interfaz limpia, rapida y facil de usar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Hero;