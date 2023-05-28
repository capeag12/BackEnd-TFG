const express = require('express');
const Almacen = require('../models/Almacen');
const auth = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const Permiso = require('../models/Permiso');
const multer = require('multer');
const router = new express.Router();
const path = require('path');
var fs = require('fs');
const bcrypt = require('bcryptjs');

router.post("/usuario/crearPermiso", auth, async (req, res) => {
    try {
        if (req.usuario) {
            let registrarPermiso = {
                nombre: req.body.nombre,
                tipo: req.body.tipo,
                owner: req.usuario._id
            }

            let permiso = new Permiso(registrarPermiso);

            await permiso.save();
            return res.status(201).send(permiso);

        } else{
            return res.status(401).send({error:'No se pudo crear el permiso'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({error:'No se pudo agregar el permiso'});
    }
});

router.post("/permisos/logPermiso", async (req, res) => {
    console.log("Realizando login");
    let token = req.body.token;
    const decoded = jwt.verify(token, 'nuevotoken');
});


    
            
module.exports = router;