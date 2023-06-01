const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const permisoSchema = new mongoose.Schema({
    nombre:{
        type: String,
        trim: true,
        default: 'Usuario'
    },
    tipo:{
        type: String,
        trim: true,
        enum: ['Movimientos', 'Almacenes', 'Envios'],
        required: true

    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'

    },
    tokenAcceso: {  
        type: String,
        
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

permisoSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({_id:user._id.toString()}, 'nuevotoken')

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

permisoSchema.pre('save', async function (next) {
    const user = this;
    const token = jwt.sign({_id:user._id.toString()}, 'nuevotoken')
    user.tokenAcceso = token
    
    
        
})

const Permiso = mongoose.model('Permiso', permisoSchema);
module.exports = Permiso;
    