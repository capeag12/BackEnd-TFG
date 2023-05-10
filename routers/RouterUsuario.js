const express = require('express');
const Almacen = require('../models/Almacen');
const auth = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const multer = require('multer');
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
            res.status(400).send({error: 'No se pudo crear el usuario'});
        }
});

router.post("/usuarios/login", async (req, res) => {
    console.log("Realizando login");
    try {
        console.log(req.body);
        const usuario = await Usuario.findByCredentials(req.body.email, req.body.password);
        
        if (!usuario) {
            return res.status(401).send({error: 'El usuario o la contraseña son incorrectos'});
        } else{
            const token = await usuario.generateAuthToken();
        
            res.send({usuario, token});
        }
        
        
    } catch (error) {
        console.log(error);
        res.status(400).send({error:'El login no fue posible'});
    }
});

router.post("/usuarios/loginToken", auth, async (req, res) => {
    
    try{
        let usuario = await Usuario.findById(req.usuario._id).populate('almacenes');
        res.status(200).send({usuario:usuario,almacenes:usuario.almacenes});
        console.log("Sesion iniciada");

    }
    catch (error) {
        res.status(400).send({error:'El login no fue posible'});
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
        res.status(500).send({error:'No se pudo realizar correctamente el logout'});
    }
});

router.get("/usuarios/me", auth, async (req, res) => {
    try{
        let usuario = await Usuario.findById(req.usuario._id).populate('almacenes');
        console.log(usuario.almacenes);
        res.status(200).send({usuario:usuario,almacenes:usuario.almacenes});
    }
    catch (error) {
        res.status(500).send({error:'No se pudo realizar correctamente el login'});
    }
});

router.get("/usuarios/me/avatar", auth, async (req, res) => {
    console.log(req.body);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });
  
router.patch("/usuarios/me/avatar", upload.single('avatar'),auth, async (req, res) => {
    console.log('Cargando avatar');
})

router.post("/usuarios/logoutAll", auth, async (req, res) => {
    try {
        req.usuario.tokens = [];
        await req.usuario.save();
        res.send("Logout exitoso");
    } catch (error) {
        res.status(500).send({error:'No se pudo realizar correctamente el logout'});
    }
});

router.get("/me", auth, async (req, res) => {
    res.send(req.usuario);
});
    
            
module.exports = router;