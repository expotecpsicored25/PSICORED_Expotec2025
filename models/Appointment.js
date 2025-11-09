import mongoose, { Schema, model, models } from 'mongoose'; // Añadir Schema, model, models

const AppointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  psychologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'canceled'],
    default: 'pending'
  },

  // ✅ NUEVO CAMPO: Motivo de cancelación
  cancellationReason: {
    type: String,
    required: function () {
      // La razón es requerida si, y solo si, el estado es 'canceled'
      return this.status === 'canceled';
    },
    trim: true,
    default: null, // Es nulo si la cita no ha sido cancelada
  },

}, { timestamps: true });

// Exportar el modelo
export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);