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
    try{
        let imgLocation = process.cwd()+"\\uploads\\"+req.usuario.avatar;
        if(fs.existsSync(imgLocation)){
            return res.status(200).sendFile(imgLocation)
        } else{
            await Usuario.updateOne({_id:req.usuario._id},{avatar:null});
            return res.status(404).send({error:'No se encontro el avatar'});
        }
        
    }catch (error) {
        console.log(error);
        return res.status(500).send({error:'No se pudo realizar correctamente el login'});
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        let name =req.usuario._id + path.extname(file.originalname)
        let imgLocation = process.cwd()+"\\uploads\\"+req.usuario.avatar;
        let exist = fs.existsSync(imgLocation);
        if(exist){
            fs.unlinkSync(imgLocation);
        }
        req.usuario.avatar = name;
        req.usuario.save();
        
        
        cb(null,name );
      
    },
  });
  const upload = multer({ storage: storage });
  const realizeUpload = upload.single('avatar');

router.patch("/usuarios/me/avatar", auth, async (req, res) => {
    
    realizeUpload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
        console.log(err);
          return res.status(500).json(err);
        } else if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    });

    try {
        res.status(200).send({msg:'Avatar cargado correctamente'});
    }
    catch (error) {
        console.log(error);
        res.status(500).send({error:'No se pudo cargar correctamente el nuuevo avatar'});
    }
})

router.post("/usuarios/logoutAll", auth, async (req, res) => {
    try {
        req.usuario.tokens = [];
        await req.usuario.save();
        return res.status(200).send({msg:'Logout exitoso'});
    } catch (error) {
        return res.status(500).send({error:'No se pudo realizar correctamente el logout'});
    }
});

router.get("/me", auth, async (req, res) => {
    try{
        res.status(200).send(req.usuario);
    }
    catch (error) {
        res.status(500).send({error:'No se pudo realizar correctamente el login'});
    }
});

router.patch("/usuarios/me/changePassword", auth, async (req, res) => {
    try {
        const iguales = await bcrypt.compare(req.body.oldPassword, req.usuario.password);
        if (iguales==true) {
            let usuario = req.usuario;
            usuario.password = req.body.newPassword;
            await usuario.save();
            res.status(200).send({msg:'Contraseña cambiada correctamente'});
        } else{
            return res.status(401).send({error:'La contraseña actual es incorrecta'});
        }
    } catch (error) {
        res.status(500).send({error:'No se pudo cambiar la contraseña'});
    }
});




    
            
module.exports = router;