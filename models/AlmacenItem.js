const mongoose = require('mongoose');

const almacenItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Item'
    },
    almacen: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Almacen'
    },
    cantidad: {
        type: Number,
        required: true,
        trim: true
    },
    
});

const AlmacenItem = mongoose.model('AlmacenItem', almacenItemSchema);
module.exports = AlmacenItem;