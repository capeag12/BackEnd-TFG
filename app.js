const express = require('express');
require('./db/mongoose');

const app = express();
const cors = require('cors');
const userRouter = require('./routers/RouterUsuario');
const almacenRouter = require('./routers/RouterAlmacenes');
const movimientoRouter = require('./routers/RouterMovimientos');
const permisosRouter = require('./routers/RouterPermisos');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(almacenRouter);
app.use(movimientoRouter);
app.use(permisosRouter);

app.set('trust proxy', true)

app.listen(port, () => {
    console.log('Server is up on port ' + port);
    
});

app.get('/', (req, res) => {
    res.send('Bienvenido a la API de Almacenes');
})