//Importar dependecias
const jwt = require("jwt-simple");
const moment = require("moment");
//Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;
//Funcion de autenticacion /MIDDLEWARE de autenticacion
exports.auth = (req, res, next) => {
  //Comprobars si me llega la cabecera de auth
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "Request has no authentication header",
    });
  }
  // Decodificar el token
  let token = req.headers.authorization.replace(/['"]+/g, "");
  try {
    let payload = jwt.decode(token, secret);
    //Comprobar la expiracion del token
    if (payload.exports <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "Expired token",
      });
    }
    //Agregar datos de usuarios a la request
    req.user = payload;
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "Invalid token",
      error,
    });
  }

  //Pasar a la ejecuccion de la accion
  next();
};
