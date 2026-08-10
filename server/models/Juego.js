const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  genero: {
    type: String,
    required: true
  },
  plataforma: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'jugando', 'terminado'],
    default: 'pendiente'
  },
  calificacion: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  portada: {
    type: String,
    default: ''
  },
  notas: {
    type: String,
    default: ''
  },
  fechaAgregado: {
    type: Date,
    default: Date.now
  }
});

const Juego = mongoose.model('Juego', juegoSchema);

module.exports = Juego;