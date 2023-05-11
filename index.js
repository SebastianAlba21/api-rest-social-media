//Importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");
//Mensaje de bienvenida
console.log("API Node started!");
//Conexion a las base de datos
connection();
//Crear el servidor de node
const app = express();
const port = 3900;
//Configurar el Cors
app.use(cors());
//Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Cargar configuracion de las rutas
const userRoutes = require("./routes/user");
const publiRoutes = require("./routes/publication");
const followRoutes = require("./routes/follow");
app.use("/api/user", userRoutes);
app.use("/api/publication", publiRoutes);
app.use("/api/follow", followRoutes);
//Ruta de prueba
app.get("/ruta-prueba", (req, res) => {
  return res.status(200).json({
    id: 1,
    nombre: "Sebastian",
    apellido: "Alba",
  });
});
//Poner el servidor a escuchar las peticiones http
app.listen(port, () => {
  console.log(`Servidor de NodeJS corriendo por el puerto ${port}`);
});
