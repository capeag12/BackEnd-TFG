const mongoose = require('mongoose');

const envioSchema = new mongoose.Schema({
    direccionOrigen: {
        type: String,
        required: true,
        trim: true
    },
    direccionDestino: {
        type: String,
        required: true,
        trim: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['Creado', 'En camino', 'Entregado'],
        trim: true
    },
    movimiento:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Movimiento'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }

},{
    timestamps: true
});

envioSchema.virtual('movimiento', {
    ref: 'Movimiento',
    localField: 'movimiento',
    foreignField: '_id'
});

const Envio = mongoose.model('Envio', envioSchema);

module.exports = Envio;

