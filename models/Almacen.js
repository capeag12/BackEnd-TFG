const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const almacenSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    direccion: {
        type: String,
        required: true,
        trim: true
    },
    imagen: {
        type: String,
        required: true,
        trim: true
    },
    items: [{
        nombre: {
            type: String,
            required: true,
            ref: 'Item'
        },
        cantidad: {
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


const Almacen = mongoose.model('Almacen', almacenSchema);

module.exports = Almacen;