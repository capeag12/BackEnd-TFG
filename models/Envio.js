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
        enum: ['Creado','Preparando','En camino', 'Entregado'],
        trim: true
    },
    
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }

},{
    timestamps: true
});


const Envio = mongoose.model('Envio', envioSchema);

module.exports = Envio;

