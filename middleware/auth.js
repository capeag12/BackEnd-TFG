const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Permiso = require('../models/Permiso');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'nuevotoken');
        const usuario = await Usuario.findOne({_id: decoded._id, 'tokens.token': token});

        if (!usuario) {
            const permiso = await Permiso.findOne({_id: decoded._id, 'tokens.token': token});
            if (!permiso) {
                throw new Error();
            }
            req.permiso = permiso;
            
        }

        req.token = token;
        req.usuario = usuario;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({error: 'Please authenticate'});
    }
}

module.exports = auth;