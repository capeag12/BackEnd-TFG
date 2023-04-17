const express = require('express');
require('./db/mongoose');

const app = express();
const cors = require('cors');
const userRouter = require('./routers/RouterUsuario');
const almacenRouter = require('./routers/RouterAlmacenes');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(almacenRouter);

app.set('trust proxy', true)

app.listen(port, () => {
    console.log('Server is up on port ' + port);
    
});