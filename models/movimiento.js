const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
    almacenOrigen: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Almacen'
    },
    almacenDestino: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Almacen'
    },
    tipo: {
        type: String,
        required: true,
        enum: ['Entrada', 'Salida'],
        trim: true
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Item'
        },
        diferencia: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }

});




const Movimiento = mongoose.model('Movimiento', movimientoSchema);
module.exports = Movimiento;