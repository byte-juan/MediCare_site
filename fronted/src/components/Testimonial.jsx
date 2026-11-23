import React, { useEffect, useRef, useState } from "react";
import { testimonialStyles } from "../assets/dummyStyles";
import { Star } from "lucide-react";

const Testimonial = () => {
  const scrollRefLeft = useRef(null);
  const scrollRefRight = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

const testimonials = [
  // --- DOCTORES (6) ---
  {
    id: 1,
    name: "Dra. Valeria Mendoza",
    role: "Cardióloga",
    rating: 5,
    text: "El sistema de reserva de citas es increíblemente eficiente. Me ahorra un tiempo valioso y me ayuda a concentrarme en la atención del paciente.",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },
  {
    id: 2,
    name: "Dr. Rodrigo Quispe",
    role: "Pediatra",
    rating: 5,
    text: "Esta plataforma ha agilizado notablemente las operaciones de nuestra clínica. La gestión de pacientes es mucho más organizada.",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },
  {
    id: 3,
    name: "Dra. Lucía Paredes",
    role: "Dermatóloga",
    rating: 5,
    text: "Excelente plataforma para administrar consultas. Los recordatorios automáticos reducen drásticamente las inasistencias.",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },
  {
    id: 4,
    name: "Dr. Álvaro Castrejón",
    role: "Traumatólogo",
    rating: 4,
    text: "Tener el historial de citas y horarios sincronizados en un solo panel facilita mucho el seguimiento postoperatorio.",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },
  {
    id: 5,
    name: "Dra. Gabriela Chávez",
    role: "Ginecóloga",
    rating: 5,
    text: "Mis pacientes valoran mucho poder agendar sin llamadas largas. Mi agenda diaria ahora está siempre clara y ordenada.",
    image:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },
  {
    id: 6,
    name: "Dr. Mateo Villalobos",
    role: "Medicina Interna",
    rating: 5,
    text: "Una herramienta moderna y confiable. La reprogramación rápida evita vacíos en el consultorio cuando surge una emergencia.",
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },

  // --- PACIENTES (6) ---
  {
    id: 7,
    name: "Carlos Huamán",
    role: "Paciente",
    rating: 5,
    text: "Programar citas nunca había sido tan fácil. La interfaz es intuitiva y los recordatorios son muy útiles.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
  {
    id: 8,
    name: "Camila Rojas",
    role: "Paciente",
    rating: 5,
    text: "Reservar citas en línea las 24/7 marca la diferencia. El sistema de confirmación me da mucha tranquilidad.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
  {
    id: 9,
    name: "Diego Salazar",
    role: "Paciente",
    rating: 5,
    text: "El tiempo de espera en recepción se ha reducido bastante desde que uso esta plataforma. Muy práctica y fácil de entender.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
  {
    id: 10,
    name: "Sofía Espinoza",
    role: "Paciente",
    rating: 5,
    text: "Pude encontrar especialista para mi mamá en pocos minutos y elegir el horario exacto que mejor nos convenía.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
  {
    id: 11,
    name: "Jorge Luis Benavides",
    role: "Paciente",
    rating: 4,
    text: "Me gustó poder revisar los costos y servicios antes de confirmar la cita. Todo transparente y sin contratiempos.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
  {
    id: 12,
    name: "Mariana Flores",
    role: "Paciente",
    rating: 5,
    text: "La atención fue puntual y el proceso desde el celular es súper rápido. Definitivamente la recomiendo.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
];

  const leftTestimonials = testimonials.filter((t) => t.type === "doctor");
  const rightTestimonials = testimonials.filter((t) => t.type === "patient");

useEffect(() => {
    const scrollLeft = scrollRefLeft.current;
    const scrollRight = scrollRefRight.current;
    if (!scrollLeft || !scrollRight) return;

    const scrollSpeed = 0.6;
    let rafId;

    let leftPos = scrollLeft.scrollTop || 0;
    let rightPos =
      scrollRight.scrollTop > 0
        ? scrollRight.scrollTop
        : scrollRight.scrollHeight > 0
          ? scrollRight.scrollHeight / 2
          : 0;

    if (scrollRight.scrollHeight > 0 && scrollRight.scrollTop === 0) {
      scrollRight.scrollTop = rightPos;
    }

    const smoothScroll = () => {
      if (!isPaused) {
        const leftHalf = scrollLeft.scrollHeight / 2;
        const rightHalf = scrollRight.scrollHeight / 2;

        if (leftHalf > 0) {
          leftPos += scrollSpeed;
          if (leftPos >= leftHalf) {
            leftPos = 0;
          }
          scrollLeft.scrollTop = leftPos;
        }

        if (rightHalf > 0) {
          rightPos -= scrollSpeed;
          if (rightPos <= 0) {
            rightPos = rightHalf;
          }
          scrollRight.scrollTop = rightPos;
        }
      }
      rafId = requestAnimationFrame(smoothScroll);
    };

    rafId = requestAnimationFrame(smoothScroll);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused]);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={
          i < rating
            ? testimonialStyles.activeStar
            : testimonialStyles.inactiveStar
        }
      >
        <Star className={testimonialStyles.star} />
      </span>
    ));

  const TestimonialCard = ({ testimonial, direction }) => (
    <div
      className={`${testimonialStyles.testimonialCard} ${
        direction === "left"
          ? testimonialStyles.leftCardBorder
          : testimonialStyles.rightCardBorder
      }`}
    >
      <div className={testimonialStyles.cardContent}>
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className={testimonialStyles.avatar}
        />
        <div className={testimonialStyles.textContainer}>
          <div className={testimonialStyles.nameRoleContainer}>
            <div>
              <h4
                className={`${testimonialStyles.name} ${
                  direction === "left"
                    ? testimonialStyles.leftName
                    : testimonialStyles.rightName
                }`}
              >
                {testimonial.name}
              </h4>
              <p className={testimonialStyles.role}>{testimonial.role}</p>
            </div>
            <div className={testimonialStyles.starsContainer}>
              {renderStars(testimonial.rating)}
            </div>
          </div>

          <p className={testimonialStyles.quote}>"{testimonial.text}"</p>

          {/* Stars on small screens beneath text */}
          <div className={testimonialStyles.mobileStarsContainer}>
            {renderStars(testimonial.rating)}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className={testimonialStyles.Container}>
      <div className={testimonialStyles.headerContainer}>
        <h2 className={testimonialStyles.title}>Voces de la Verdad</h2>
        <p className={testimonialStyles.subtitle}>
          Historias reales de doctores y pacientes compartiendo su positiva
          experiencia con nuestra plataforma medica
        </p>
      </div>
      <div
        className={testimonialStyles.grid}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`${testimonialStyles.columnContainer} ${
            testimonialStyles.leftColumnBorder
          }`}
        >
          <div
            className={`${testimonialStyles.columnHeader} ${
              testimonialStyles.leftColumnHeader
            }`}
          >
            👩‍⚕️ Professionales Medicos
          </div>
          <div
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            ref={scrollRefLeft}
            className={testimonialStyles.scrollContainer}
          >
            {[...leftTestimonials, ...leftTestimonials].map((t, i) => (
              <TestimonialCard
                key={`L-${i}`}
                testimonial={t}
                direction="left"
              />
            ))}{" "}
          </div>
        </div>
        <div
          className={`${testimonialStyles.columnContainer} ${
            testimonialStyles.rightColumnBorder
          }`}
        >
          <div
            className={`${testimonialStyles.columnHeader} ${
              testimonialStyles.rightColumnHeader
            }`}
          >
            🧑‍💼 Pacientes
          </div>
          <div
            ref={scrollRefRight}
            className={testimonialStyles.scrollContainer}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {[...rightTestimonials, ...rightTestimonials].map((t, i) => (
              <TestimonialCard
                key={`R-${i}`}
                testimonial={t}
                direction="right"
              />
            ))}
          </div>
        </div>
      </div>
      <style>{testimonialStyles.animationStyles}</style>
    </div>
  );
};

export default Testimonial;
