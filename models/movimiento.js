const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
    almacenOrigen: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Almacen'
    },
    almacenOrigenName: {
        type: String,
        required: false,
    },
    almacenDestino: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Almacen'
    },
    almacenDestinoName: {
        type: String,
        required: true,
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

},{
    timestamps: true
});

movimientoSchema.virtual('origen', {
    ref: 'Almacen',
    localField: 'almacenOrigen',
    foreignField: '_id'
});

movimientoSchema.virtual('destino', {
    ref: 'Almacen',
    localField: 'almacenDestino',
    foreignField: '_id'
});

movimientoSchema.virtual('itemsDiferencia', {
    ref: 'Item',
    localField: 'items.item',
    foreignField: '_id'
});

const Movimiento = mongoose.model('Movimiento', movimientoSchema);
module.exports = Movimiento;