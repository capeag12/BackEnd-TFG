const express = require('express');
const auth = require('../middleware/auth');
const Almacen = require('../models/Almacen');
const AlmacenItem = require('../models/AlmacenItem');
const Item = require('../models/Item');
const Usuario = require('../models/Usuario');
const Movimiento = require('../models/Movimiento');
const Envio = require('../models/Envio');

const router = new express.Router();

router.post("/almacenes/crearAlmacen", auth, async (req, res) => {
    
    try{

        if (req.usuario) {
            const almacen = new Almacen({
                ...req.body,
                owner: req.usuario._id
            });
            await almacen.save();
            return res.status(201).send(almacen);
        } else if(req.permiso){
            if (req.permiso.tipo == "Almacenes") {
                const almacen = new Almacen({
                    ...req.body,
                    owner: req.permiso.owner
                });
                await almacen.save();
                return res.status(201).send(almacen);
            }
            else{
                return res.status(400).send("No tienes permisos para crear almacenes");
            }
            
        } else{
            return res.status(400).send("No tienes permisos para crear almacenes");
        }
        
    }
    catch (error) {
        return res.status(400).send("No se pudo crear el almacen");
    }
});

router.delete("/almacenes/eliminarAlmacen/:id", auth, async (req, res) => {
    
    try{
        if (req.usuario || (req.permiso && req.permiso.tipo == "Almacenes")) {
            let owner;

            if (req.usuario) {
                owner = req.usuario._id;
            } else{
                owner = req.permiso.owner;
            }

            const almacen = await Almacen.findOneAndDelete({_id: req.params.id, owner: owner});
            await almacen.deleteAllAlmacenItems();
            if (!almacen) {
                return res.status(404).send();
            }
            
            return res.status(204).send("Eliminado correctamente");
        } else{
            return res.status(400).send("No tienes permisos para eliminar almacenes");
        }

    }
    catch (error) {
        console.log(error);
        return res.status(500).send("Algo ha salido mal");
    }
});



router.put("/almacenes/addProducto/:id", auth, async (req, res) => {
    
    try{
        if (req.usuario || (req.permiso && req.permiso.tipo == "Almacenes")) {

            let owner;

            if (req.usuario) {
                owner = req.usuario._id;
            } else{
                owner = req.permiso.owner;
            }

            const item = new Item(req.body);
            const almacen = await Almacen.findOne({_id: req.params.id, owner: owner});
            const itemBuscar = await Item.exists({nombre: req.body.nombre, descripcion: req.body.valor});
            if (!almacen) {
                return res.status(404).send();
            }
            if (!itemBuscar) {
                await item.save();
            }
            const almacenItem = new AlmacenItem({item: item._id, almacen: almacen._id, cantidad: req.body.cantidad});
            await almacenItem.save();

            return res.status(201).send({id:almacenItem.id,cantidad: almacenItem.cantidad, item: item});
        } else{
            return res.status(400).send("No tienes permisos para agregar productos");
        }

        
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
});

router.get("/almacenes/getItemsAlmacen/:id", auth, async (req, res) => {
    
    try{
        if (req.usuario || (req.permiso && req.permiso.tipo == "Almacenes")) {
            let owner;

            if (req.usuario) {
                owner = req.usuario._id;
            } else{
                owner = req.permiso.owner;
            }

            const almacen = await Almacen.findOne({_id: req.params.id, owner: owner}).populate('items');
            if (!almacen) {
                return res.status(404).send();
            }
            const items = [];
            for (let i = 0; i < almacen.items.length; i++) {
                let itemFind = await Item.findById(almacen.items[i].item._id);
                itemFind.cantidad = almacen.items[i].cantidad;
                
                items.push({id: almacen.items[i]._id, item:itemFind, cantidad: almacen.items[i].cantidad});
            }
            return res.status(200).send(items);
        }

        
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
});

router.put("/almacenes/actualizarMercancia", auth, async (req, res) => {
    
    try {

        if (req.usuario || (req.permiso && req.permiso.tipo == "Almacenes")) {
            let owner;

            if (req.usuario) {
                owner = req.usuario._id;
            }
            else{
                owner = req.permiso.owner;
            }

            let restados = req.body.restados;
            let added = req.body.added;
            let listaRestados = [];
            let listaVaciosOriginal=[]
            let almacenItemCambiados = [];
            let movimientos = [];
            let listaItemsRestados = [];

            let almacenOrigen = await Almacen.findById(req.body.start);
            let almacenDestino = await Almacen.findById(req.body.end);
            restados.forEach(element => {
                let diferenciaCantidad = element.cantidad - element.cantidadCambiada;
                let diff  = element.cantidadCambiada - element.cantidad;
                
                let itemMovimiento = {item: element.item.id, diferencia: diff};
                listaItemsRestados.push(itemMovimiento);

                if(element.cantidadCambiada == 0){
                    listaVaciosOriginal.push(element.id);
                } else{
                    let almacenItemOriginal = new AlmacenItem({_id: element.id, item: element.item.id, almacen: req.body.start, cantidad: element.cantidadCambiada});
                    almacenItemCambiados.push(almacenItemOriginal);
                }
                
                let nuevoItem = new AlmacenItem({item: element.item.id, almacen: req.body.end, cantidad: diferenciaCantidad});
                listaRestados.push(nuevoItem);
            });
            listaRestados.forEach(async element => {
                let itemTraido = await AlmacenItem.findOne({item: element.item, almacen: element.almacen});
                
                if (itemTraido) {
                    itemTraido.cantidad += element.cantidad;
                    itemTraido.save();
                }
                else
                {
                    await element.save();
                }

            });

            

            if (listaItemsRestados.length > 0) {
                let movimientoRestado = new Movimiento({
                    almacenOrigen: req.body.start,
                    almacenOrigenName: almacenOrigen.nombre,
                    almacenDestino: req.body.end,
                    almacenDestinoName: almacenDestino.nombre,
                    tipo: "Salida",
                    items: listaItemsRestados,
                    owner: owner
                })

                let envio = new Envio({
                    direccionOrigen: almacenOrigen.direccion,
                    direccionDestino: almacenDestino.direccion,
                    estado: "Creado",
                    owner: owner
                });

                await Envio.create(envio);
                movimientos.push(movimientoRestado);
            }
            
            if (added.length > 0) {
                let listaItemsAdded = [];
                added.forEach(async (element) => {
                    console.log(element);
                    let diferencia = element.cantidadCambiada - element.cantidad;
                    listaItemsAdded.push({item:element.item.id,diferencia:diferencia });
                    await AlmacenItem.updateOne({_id: element.id}, {cantidad: element.cantidadCambiada});
                    
                });
                let movimientoAdded = new Movimiento({
                    almacenDestino: req.body.start,
                    almacenDestinoName: almacenOrigen.nombre,
                    tipo: "Entrada",
                    items: listaItemsAdded,
                    owner: owner
                    
                }) 
                console.log(movimientoAdded);
                movimientos.push(movimientoAdded);
                
            }
                
            
            await AlmacenItem.deleteMany({_id: {$in: listaVaciosOriginal}});
            almacenItemCambiados.forEach(async element => {
            await AlmacenItem.updateOne({_id: element.id}, element);
            });
            await Movimiento.insertMany(movimientos);
            return res.status(200).send();


        } else{
            return res.status(400).send("No tienes permisos para actualizar mercancia");
        }
        
        
    } catch (error) {
        console.log(error);
        return res.status(500).send();
        
    }

});




    


module.exports = router;