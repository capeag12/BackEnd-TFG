const express = require('express');
const auth = require('../middleware/auth');
const Almacen = require('../models/Almacen');
const Usuario = require('../models/Usuario')
const router = new express.Router();

router.post("/almacenes/crearAlmacen", auth, async (req, res) => {
    try{
        const almacen = new Almacen({
            ...req.body,
            owner: req.usuario._id
        });
        await almacen.save();
        res.status(201).send(almacen);
    }
    catch (error) {
        res.status(400).send("No se pudo crear el almacen");
    }
});

module.exports = router;