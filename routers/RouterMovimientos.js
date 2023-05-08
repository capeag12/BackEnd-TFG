const express = require('express');
const auth = require('../middleware/auth');
const Almacen = require('../models/Almacen');
const AlmacenItem = require('../models/AlmacenItem');
const Item = require('../models/Item');
const Usuario = require('../models/Usuario');
const Movimiento = require('../models/Movimiento');
var pdf = require('pdf-creator-node');
var fs = require('fs');

const router = new express.Router();

router.get("/movimientos/getAllMovements", auth, async (req, res) => {
    try{
        const movimientos = await Movimiento.find({owner: req.usuario._id}).populate('itemsDiferencia').populate('destino').populate('origen').sort({createdAt: -1});
    
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
                almacenOrigen: movimiento.origen[0],
                almacenDestino: movimiento.destino[0],
                items: items,
                fecha: movimiento.createdAt
            }
            movimientosEnviar.push(movimientoEnviar)

        })
        console.log(movimientosEnviar)
        return res.status(200).send(movimientosEnviar);


    }
    catch (error) {
        return res.status(500).send({
            error: "No se pudo obtener los movimientos"
        });
    }

    
});

router.get("/movimientos/getPDF/:id", auth, async (req, res) => {
    try{
        
        let pdfLocation = process.cwd()+"\\pdfTemplates\\movementPDF.html"
        var html = fs.readFileSync(pdfLocation, 'utf8');

        let movimiento = await Movimiento.findById(req.params.id).populate('itemsDiferencia').populate('destino').populate('origen');

        

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
            origin = movimiento.origen[0].nombre
        }
            
        

        let data = {
            items: itemsHTML,
            almacenOrigen: origin,
            almacenDestino: movimiento.destino[0].nombre,
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

            footer: {
                height: "30mm",
                contents: {
                    default:`<div class="footer">
                                <p>Footer</p>
                            </div>`
                }
            }
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
    catch (error) {
        console.log(error);
    }
    
});

module.exports = router;