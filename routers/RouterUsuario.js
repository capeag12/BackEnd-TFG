const express = require('express');
const Almacen = require('../models/Almacen');
const auth = require('../middleware/auth');
const Usuario = require('../models/Usuario')
const router = new express.Router();

router.post("/usuarios/registrarUsuario", async (req, res) => {
    const usuario = new Usuario(req.body);

    let existe = await Usuario.exists({email: usuario.email});

    if (existe) {
        return res.status(400).send({error: 'El usuario ya existe'});
    }
    try {
        await usuario.save();
        const token = await usuario.generateAuthToken();
        res.status(201).send({usuario, token});
        } catch (error) {
            res.status(400).send(error);
        }
});

router.post("/usuarios/login", async (req, res) => {
    try {
        console.log(req.body);
        const usuario = await Usuario.findByCredentials(req.body.email, req.body.password);
        const token = await usuario.generateAuthToken();
        
        res.send({usuario, token});
    } catch (error) {
        console.log(error);
        res.status(400).send("El login no fue posible");
    }
});

router.post("/usuarios/loginToken", auth, async (req, res) => {
    
    try{
        let usuario = await Usuario.findById(req.usuario._id).populate('almacenes');
        console.log(usuario.almacenes);
        res.status(200).send({usuario:usuario,almacenes:usuario.almacenes});
    }
    catch (error) {
        res.status(400).send("El login no fue posible");
    }
});

router.post("/usuarios/logout", auth, async (req, res) => {
    try {
        req.usuario.tokens = req.usuario.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.usuario.save();
        res.send("Logout exitoso");
    } catch (error) {
        res.status(500).send();
    }
});

router.post("/usuarios/logoutAll", auth, async (req, res) => {
    try {
        req.usuario.tokens = [];
        await req.usuario.save();
        res.send("Logout exitoso");
    } catch (error) {
        res.status(500).send();
    }
});

router.get("/me", auth, async (req, res) => {
    res.send(req.usuario);
});
    
            
module.exports = router;