import mongoose from "mongoose";
import mogoose from "mongoose";

const serviceAppointmentSchema = mongoose.Schema({
    createBy: {
        type: String,
        default: null,
        index: true
    },

  patientName: {
    type: String,
      required: true,
        trim: true,
    },

  mobile: {
    type: String,
      required: true,
        trim: true,
    },

  age: {
    type: Number,
      min: 0,
    },

  gender: {
    type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },


    //Info de Servicio
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
        required: true,
    },

  serviceName: {
    type: String,
      required: true,
    },

  serviceImage: {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },

  fees: {
    type: Number,
      required: true,
        min: 0,
    },

    //horario info
  date: {
    type: String,
      required: true,
        index: true,
    },

  hour: {
    type: Number,
      required: true,
    },

  minute: {
    type: Number,
      required: true,
    },

  ampm: {
    type: String,
      enum: ["AM", "PM"],
      required: true,
    },

    // estado de la cita
  status: {
    type: String,
      enum: ["Pending", "Confirmed", "Rescheduled", "Completed", "Canceled"],
      default: "Pending",
      index: true,
    },

  rescheduledTo: {
    date: { type: String },
    hour: { type: Number },
    minute: { type: Number },
    ampm: { type: String, enum: ["AM", "PM"] },
  },

  // metodo de pago y estado
  payment: {
    method: {
      type: String,
        enum: ["Cash", "Online"],
        default: "Cash",
      },

    status: {
      type: String,
     enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending",
      },

    amount: {
      type: Number,
        required: true,
      },

    providerId: {
      type: String, //id del pago STRIPE
        default: "",
      },

    paidAt: {
      type: Date,
        default: null,
      },

    sessionId: {
      type: String, // strip sessionid
        default: "",
        
      },

    meta: {
      type: mongoose.Schema.Types.Mixed,
        default: { },
    },
  },
}, {
    timestamps: true
});

serviceAppointmentSchema.index({date: 1, status: 1});
serviceAppointmentSchema.index({ serviceId: 1});
serviceAppointmentSchema.index({"payment.sessionId": 1});

const ServiceAppointment = mongoose.models.ServiceAppointment ||
mongoose.model("SerivceAppointment", serviceAppointmentSchema);

export default ServiceAppointment;
