const express = require('express');
const auth = require('../middleware/auth');
const Almacen = require('../models/Almacen');
const AlmacenItem = require('../models/AlmacenItem');
const Item = require('../models/Item');
const Usuario = require('../models/Usuario');
const Movimiento = require('../models/Movimiento');
var pdf = require('pdf-creator-node');
var fs = require('fs');
const Envio = require('../models/Envio');
const { default: mongoose } = require('mongoose');

const router = new express.Router();

router.get("/movimientos/getAllMovements", auth, async (req, res) => {
    
    try{
        if (req.usuario || (req.permiso && req.permiso.tipo == "Movimientos")) {
            console.log("Ha entrado en el if")
            let owner;

            if (req.usuario) {
                owner = req.usuario._id;
            } else{
                owner = req.permiso.owner;
            }
            console.log("Ha entrado en el if")

            const movimientos = await Movimiento.find({owner: owner}).populate('itemsDiferencia').populate('destino').populate('origen').sort({createdAt: -1});
    
            let movimientosEnviar = []

            movimientos.forEach(movimiento => {
                let items = []
                let movimientoItem = movimiento.itemsDiferencia

                for (let i = 0; i < movimientoItem.length; i++) {
                    let item = {
                        item: movimientoItem[i],
                        diferencia: movimiento.items[i].diferencia
                    }
                    items.push(item)
                    
                }

                let movimientoEnviar = {
                    id: movimiento._id,
                    tipo: movimiento.tipo,
                    almacenOrigen: movimiento.almacenOrigenName,
                    almacenDestino: movimiento.almacenDestinoName,
                    items: items,
                    fecha: movimiento.createdAt
                }
                movimientosEnviar.push(movimientoEnviar)

            })
            console.log(movimientosEnviar)
            return res.status(200).send(movimientosEnviar);
        } else{
            return res.status(401).send({msg: "No tienes permiso para realizar esta acción"})
        }
    }
    catch (error) {
        return res.status(500).send({
            error: "No se pudo obtener los movimientos"
        });
    }

    
});

router.get("/movimientos/getPDF/:id", auth, async (req, res) => {
    
    try{
        if (req.usuario || (req.permiso && req.permiso.tipo == "Movimientos")) {
            let owner;
            if (req.usuario) {
                owner = req.usuario._id;
            } else{
                owner = req.permiso.owner;
            }

            let pdfLocation = process.cwd()+"/pdfTemplates/movementPDF.html"
            console.log("localizacion pdf"+pdfLocation)
            var html = fs.readFileSync(pdfLocation, 'utf8');

            let movimiento = await Movimiento.findOne({_id:req.params.id, owner:owner}).populate('itemsDiferencia').populate('destino').populate('origen');

            let movItems = movimiento.itemsDiferencia
            let itemsHTML = []
            for (let i = 0; i < movItems.length; i++) {
                let item = {
                    nombre: movItems[i].nombre,
                    valor: movItems[i].valor,
                    cantidad: movimiento.items[i].diferencia
                }
                console.log(item)
                itemsHTML.push(item)
                
            }

            let origin

            if (movimiento.origen[0] == null) {
                origin = "Añadido desde almacen externo"
            }
            else{
                origin = movimiento.almacenOrigenName
            }
                
            let nombreDestino
            if (movimiento.almacenDestinoName == null) {
                nombreDestino = "Eliminado"
            }
            else{
                nombreDestino = movimiento.almacenDestinoName
            }
                
            

            let data = {
                items: itemsHTML,
                almacenOrigen: origin,
                almacenDestino: nombreDestino,
                fecha: movimiento.createdAt

            }
            console.log(data)

            var options = {
                format: "A4",
                orientation: "portrait",
                border: "10mm",
                header:{
                    height: "35mm",
                    contents: `<div style="width: 80%; float:left;margin-left: 10%;margin-right: 10%;">
                                    <div style="width: 50%; float: left; text-align: start;">
                                        <h5>Almacen origen:</h5>
                                        <h4>${data.almacenOrigen}</h4>
                                    </div>
                                    <div style="width: 50%; float: right; text-align: end;">
                                        <h5>Almacen destino:</h5>
                                        <h4>${data.almacenDestino}</h4>
                                    </div>
                                </div>`
                },

            
            }

            var document = {
                html: html,
                data:data ,
                path: `./pdfTemplates/${movimiento._id}.pdf`,
                type: "",
            };

            let pdfResult = await pdf.create(document, options)
            res.status(200).sendFile(pdfResult.filename)
            console.log(pdfResult.filename)
            fs.unlink(pdfResult.filename, (err) => {});

            
        }
        else{
            return res.status(401).send({msg: "No tienes permiso para realizar esta acción"})
        }

        
        
    }
    catch (error) {
        console.log(error);
    }
    
});

router.get("/movimientos/getAllEnvios", auth, async (req, res) => {
    
    try {

        if(req.usuario || (req.permiso && req.permiso.tipo == "Envios")){
            let owner;
            if (req.usuario) {
                owner = req.usuario._id;
            }
            else{
                owner = req.permiso.owner;
            }

            let envios = await Envio.find({owner: owner}).sort({createdAt: -1})

            let enviosEnviar = []
            if (envios.length != 0) {
                envios.forEach(element => {
                console.log(element)
                let enviar = {
                    id: element._id,
                    destino: element.direccionDestino,
                    estado: element.estado,
                    fecha: element.createdAt

                }
                enviosEnviar.push(enviar)
            });
            }
            

            return res.status(200).send(enviosEnviar)
        }
        else{
            return res.status(401).send({msg: "No tienes permiso para realizar esta acción"})
        }

        
    } catch (error) {
        console.log(error)
        return res.status(500).send({error: "No se pudo obtener los envios"})
    }
})

router.patch("/movimientos/actualizarEnvio/:id", auth, async (req, res) => {
    
    try {

        if(req.usuario || (req.permiso && req.permiso.tipo == "Envios")){
            let owner;
            if (req.usuario) {
                owner = req.usuario._id;
            }
            else{
                owner = req.permiso.owner;
            }
            let objId = new mongoose.mongo.ObjectId(req.params.id)
            let envio = await Envio.findOne({_id: objId, owner: req.usuario._id})
            if (!envio) {
                return res.status(404).send({error: "No se encontro el envio"})
            } else{
                if(envio.estado == "Creado"){
                    envio.estado = "Preparando"
                } else if(envio.estado == "Preparando"){
                    envio.estado = "En camino"
                }
                else if(envio.estado == "En camino"){
                    envio.estado = "Entregado"
                }

                await envio.save()
                return res.status(201).send(envio);
            }
        } else{
            return res.status(401).send({msg: "No tienes permiso para realizar esta acción"})
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({error: "No se pudo actualizar el envio"})
    }

})

module.exports = router;