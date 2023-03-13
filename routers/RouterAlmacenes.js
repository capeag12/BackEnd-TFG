const express = require('express');
const auth = require('../middleware/auth');
const Almacen = require('../models/Almacen');
const AlmacenItem = require('../models/AlmacenItem');
const Item = require('../models/Item');
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

router.delete("/almacenes/eliminarAlmacen/:id", auth, async (req, res) => {
    try{
        const almacen = await Almacen.findOneAndDelete({_id: req.params.id, owner: req.usuario._id});
        if (!almacen) {
            return res.status(404).send();
        }
        return res.status(204).send(almacen);
    }
    catch (error) {
        return res.status(500).send();
    }
});

router.put("/almacenes/addProducto/:id", auth, async (req, res) => {
    try{
        const item = new Item(req.body);
        const almacen = await Almacen.findOne({_id: req.params.id, owner: req.usuario._id});
        const itemBuscar = await Item.exists({nombre: req.body.nombre, descripcion: req.body.descripcion});
        if (!almacen) {
            return res.status(404).send();
        }
        if (!itemBuscar) {
            await item.save();
        }
        const almacenItem = new AlmacenItem({item: item._id, almacen: almacen._id, cantidad: req.body.cantidad});
        await almacenItem.save();

        return res.status(200).send(almacen);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
});

    


module.exports = router;