const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Almacen = require('./Almacen');
const {default:isEmail} = require('validator/lib/isemail');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        
    }},
    password: {
        type: String,
        required: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"')
            }
            if(value.length < 6){
                throw new Error('Password must be at least 6 characters')
            }
        }
        
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{
    toJSON: { virtuals: true },
});

userSchema.virtual('almacenes', {
    ref: 'Almacen',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({_id:user._id.toString()}, 'nuevotoken')

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const usuario = await Usuario.findOne({email})
    console.log(usuario)
    if(!usuario){
        throw new Error('Unable to login')
    }
    const iguales = await bcrypt.compare(password, usuario.password)
    console.log(iguales)
    if(!iguales){
        throw new Error('Unable to login')
    }
    return usuario
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
        
})

userSchema.pre('remove', async function (next) {
    const user = this;
    await Almacen.deleteMany({owner: user._id})
    next();
})

const Usuario = mongoose.model('Usuario', userSchema);
module.exports = Usuario;