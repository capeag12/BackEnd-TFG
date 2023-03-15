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

itemSchema.methods.toJSON = function () {
    const item = this;
    const itemObject = item.toObject();
    delete itemObject.__v;
    return itemObject;
}

itemSchema.pre('delete', async function (next) {
    const item = this;
    await AlmacenItem.deleteMany({item: item._id});
    next();
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;