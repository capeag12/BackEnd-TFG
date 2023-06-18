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
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

router.post("/usuario/crearPermiso", auth, async (req, res) => {
    
    try {
        if (req.usuario) {
            console.log("req.usuario._id: " + req.usuario);
            let registrarPermiso = {
                nombre: req.body.nombre,
                tipo: req.body.tipo,
                owner: req.usuario._id
            }

            console.log(registrarPermiso);

            let permiso = new Permiso(registrarPermiso);

            await permiso.save();
            console.log(permiso);

            const token = await permiso.generateAuthToken();
            let permisoEnviar = {
                _id: permiso._id,
                nombre: permiso.nombre,
                tokenAcceso:permiso.tokenAcceso,
            }
            return res.status(200).send({permiso:permisoEnviar, token:token, tipo:permiso.tipo});
            

        } else{
            console.log("No se pudo crear el permiso");
            return res.status(401).send({error:'No se pudo crear el permiso'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({error:'No se pudo agregar el permiso'});
    }
});

router.post("/permisos/logPermiso", async (req, res) => {
    try {
        console.log("Realizando login");
        let token = req.body.token;
        console.log(token);
        const decoded = jwt.verify(token, 'nuevotoken');
        console.log(decoded);
        let permiso = await Permiso.findOne({ _id: new mongoose.mongo.ObjectId(decoded._id), tokenAcceso: token });
        console.log(permiso);
        if (!permiso) {
            return res.status(401).send({ error: 'No se pudo realizar el login' });
        }
        else{
            const token = await permiso.generateAuthToken();
            let permisoEnviar = {
                _id: permiso._id,
                nombre: permiso.nombre,
                email:permiso.nombre,
            }
            return res.status(200).send({usuario:permisoEnviar, token:token, tipo:permiso.tipo});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'No se pudo realizar el login' });
    }


});

router.get("/permisos/getPermisos", auth, async (req, res) => {
    try{
        if (req.usuario) {
            let permisos = await Permiso.find({owner:req.usuario._id});

            let permisosEnviar = [];

            permisos.forEach(permiso => {
                let permisoEnviar = {
                    _id:permiso._id,
                    nombre:permiso.nombre,
                    tipo:permiso.tipo,
                    tokenAcceso:permiso.tokenAcceso
                }
                permisosEnviar.push(permisoEnviar);

            });

            return res.status(200).send({permisos:permisosEnviar});
        }
        else{
            return res.status(401).send({error:'No se pudo obtener los permisos'});
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).send({error:'No se pudo obtener los permisos'});
    }

});


router.delete("/permisos/eliminarPermiso/:id", auth, async (req, res) => {
    try {
        if (req.usuario) {
            await Permiso.deleteOne({_id:req.params.id});
            return res.status(201).send({mensaje:'Permiso eliminado'});
        } else{
            return res.status(401).send({error:'No se pudo eliminar el permiso'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({error:'No se pudo eliminar el permiso'});
    }
})


    
            
module.exports = router;