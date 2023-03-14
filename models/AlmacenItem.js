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
    
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
    });

almacenItemSchema.methods.toJSON = function () {
    const almacenItem = this;
    const almacenItemObject = almacenItem.toObject();

    delete almacenItemObject._id;
    delete almacenItemObject.__v;
    delete almacenItemObject.id;

    return almacenItemObject;
}


const AlmacenItem = mongoose.model('AlmacenItem', almacenItemSchema);
module.exports = AlmacenItem;