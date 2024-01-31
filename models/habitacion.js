const mongoose = require("mongoose");

incidenciasSchema = new mongoose.Schema({
  descripcion: {
    type: String,
    required: [true, "Debes añadir una descripción."],
  },

  fechaInicio: {
    type: Date,
    required: [true, "La fecha de inicio es obligatoria."],
    default: Date.now(),
  },

  fechaFin: {
    type: Date,
  },

  imagen: {
    type: String,
  },
});

let habitacionSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: [true, "Debes añadir el número de la habitación."],
    min: [1, "El número de la habitación debe ser al menos 1."],
    max: [100, "El número de la habitación no puede ser mayor que 100."],
  },

  tipo: {
    type: String,
    required: [true, "El tipo de habitación debe ser 'individual', 'doble', 'familiar' o 'suite'"],
    enum: ["individual", "doble", "familiar", "suite"],
  },

  descripcion: {
    type: String,
    required: [true, "Debes añadir una descripción."],
  },
  ultimaLimpieza: {
    type: Date,
    required: [true, "La fecha de última limpieza es obligatoria."],
    default: Date.now(),
  },
  precio: {
    type: Number,
    required: [true, "Debes añadir un precio."],
    min: [0, "El precio no puede ser menor que 0."],
    max: [250, "El precio no puede ser mayor que 250."],
  },

  imagen: {
    type: String,
    required: false,
  },

  incidencias: [incidenciasSchema],
});

let Habitacion = mongoose.model("habitaciones", habitacionSchema);
module.exports = Habitacion;
