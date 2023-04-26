const express = require('express');
const auth = require('../middleware/auth');
const Almacen = require('../models/Almacen');
const AlmacenItem = require('../models/AlmacenItem');
const Item = require('../models/Item');
const Usuario = require('../models/Usuario');
const Movimiento = require('../models/Movimiento');

const router = new express.Router();

router.get("/movimientos/getAllMovements", auth, async (req, res) => {
    try{
        const movimientos = await Movimiento.find({owner: req.usuario._id}).populate('itemsDiferencia').populate('destino').populate('origen');
    
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

module.exports = router;