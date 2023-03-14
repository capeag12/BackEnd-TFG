const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    valor: {
        type: Number,
        required: true,
        trim: true
    },
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;