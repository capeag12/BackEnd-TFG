const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
    almacenOrigen: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Almacen'
    },
    almacenDestino: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Almacen'
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'AlmacenItem'
        },
        cantidadInicial: {
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