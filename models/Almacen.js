const mongoose = require('mongoose');
const AlmacenItem = require('./AlmacenItem');

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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }
});

almacenSchema.virtual('items', {
    ref: 'AlmacenItem',
    localField: '_id',
    foreignField: 'almacen'
});


almacenSchema.methods.deleteAllAlmacenItems = async function () {
    const almacen = this;
    await AlmacenItem.deleteMany({ almacen: almacen._id });
}

const Almacen = mongoose.model('Almacen', almacenSchema);

module.exports = Almacen;