//Importacion de dependencias
const bycript = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

//Importacion de modelos
const User = require("../models/user");
const Follow = require("../models/follow");
const Publication = require("../models/publication");

//Importar servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const validate = require("../helpers/validate");

//Acciones de prueba
const pruebaUser = (req, res) => {
  return res
    .status(200)
    .send({ message: "Message send from controllers/user.js", user: req.user });
};
//Registro de usuarios.
const register = (req, res) => {
  //Recoger datos de la peticion
  let params = req.body;
  //Comprobar que me llegan bien (validacion)
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Missing data",
    });
  }
  //Validacion avanzada
  try {
    validate(params);
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Cannot surpassed validation",
    });
  }
  //Control de usuarios duplicados
  User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { nick: params.nick.toLowerCase() },
    ],
  }).exec(async (error, users) => {
    if (error)
      return res.status(500).json({
        status: "error",
        message: "Query error",
      });
    if (users && users.length >= 1) {
      return res.status(200).send({
        status: "success",
        message: "User already exist",
      });
    }
    //Cifrar la contraseña
    let pwd = await bycript.hash(params.password, 10);
    params.password = pwd;

    //Crear objeto de usuario
    let user_to_save = new User(params);
    //Guardar usuario en la base de datos
    user_to_save.save((error, userStored) => {
      if (error || !userStored)
        return res.status(500).send({
          status: "error",
          message: "Error saving the user",
        });
      userStored.toObject();
      delete userStored.password;
      delete userStored.role;
      //Devolver un resultado
      return res.status(200).json({
        status: "success",
        message: "User successful registration",
        user: userStored,
      });
    });
  });
};

const login = (req, res) => {
  //Recoger paramentros por el body
  let params = req.body;
  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Missing data to send",
    });
  }
  //Buscar en la base de datos si existe
  User.findOne({ email: params.email })
    //.select({ password: 0 })
    .exec((error, user) => {
      if (error || !user)
        return res.status(404).send({
          status: "error",
          message: "user does not exist",
        });
      //Comprobar la contraseña
      let pwd = bycript.compareSync(params.password, user.password);
      if (!pwd) {
        return res.status(400).send({
          status: "error",
          message: "Password error",
        });
      }
      //Token
      const token = jwt.createToken(user);
      //Datos del usuario
      return res.status(200).send({
        status: "success",
        message: "Correct login",
        user: {
          id: user._id,
          name: user.name,
          nick: user.nick,
        },
        token,
      });
    });
};

const profile = (req, res) => {
  //Recibir el paramentro del id del usuario por url
  const id = req.params.id;
  //Consulta para sacar los datos del usuario
  User.findById(id)
    .select({ password: 0, role: 0 })
    .exec(async (error, userProfile) => {
      if (error || !userProfile) {
        return res.status(404).send({
          status: "error",
          message: "User does no exist",
        });
      }
      //Info de seguimiento
      const followInfo = await followService.followThisUser(req.user.id, id);
      //Devolver el resultado
      return res.status(200).send({
        status: "success",
        user: userProfile,
        following: followInfo.following,
        follower: followInfo.followers,
      });
    });
};

const list = (req, res) => {
  //Controlar la pagina en la que estamos
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);
  //Consultar con mongoose paginate
  let itemPerPage = 5;
  User.find()
    .select("-password -email -role -__v")
    .sort("_id")
    .paginate(page, itemPerPage, async (error, users, total) => {
      if (error || !users) {
        return res.status(404).send({
          status: "error",
          message: "Not users available",
          error,
        });
      }
      //Listado de quien estoy siguiendo como identificado
      let followUserId = await followService.followUserIds(req.user.id);
      //Devolver el resultado
      return res.status(200).send({
        status: "success",
        users,
        page,
        itemPerPage,
        total,
        pages: Math.ceil(total / itemPerPage),
        user_following: followUserId.following,
        user_follow_me: followUserId.followers,
      });
    });
};

const update = (req, res) => {
  //Recoger la info del usuario a actualizar
  let userIdentity = req.user;
  let userToUpdate = req.body;
  //Eliminar campos sobrantes
  delete userIdentity.iat;
  delete userIdentity.exp;
  delete userIdentity.role;
  delete userIdentity.image;
  //Comprobar si el usuario ya existe
  User.find({
    $or: [
      { email: userToUpdate.email.toLowerCase() },
      { nick: userToUpdate.nick.toLowerCase() },
    ],
  }).exec(async (error, users) => {
    if (error)
      return res.status(500).json({
        status: "error",
        message: "Query error",
      });
    let userIsset = false;
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsset = true;
    });
    if (userIsset) {
      return res.status(200).send({
        status: "success",
        message: "User already exist",
      });
    }

    //Cifrar la contraseña
    if (userToUpdate.password) {
      let pwd = await bycript.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    } else {
      delete userToUpdate.password;
    }
    try {
      //Buscar y actualizar
      let userUpdate = await User.findByIdAndUpdate(
        { _id: userIdentity.id },
        userToUpdate,
        { new: true }
      );

      if (!userUpdate) {
        return res.status(400).json({
          status: "error",
          message: "Error updating user",
        });
      }
      //Devolver respuesta
      return res.status(200).send({
        status: "success",
        message: "Updated",
        user: userUpdate,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error updating",
      });
    }
  });
};

const upload = (req, res) => {
  //Recoger el fichero de imagen y comprobar que existe
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "Request has no image-file",
    });
  }
  //Conseguir el nombre del archivo
  let image = req.file.originalname;
  //Sacar la extension del archivo
  let imageSplit = image.split(".");
  let extension = imageSplit[1];
  //Comprobar la extension: Sino es correcta, borrar el archivo
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    const filePath = req.file.path;
    const fileDelete = fs.unlinkSync(filePath);
    //Devolver respuesta negativa
    return res.status(400).send({
      status: "error",
      message: "Invalid extension",
    });
  }
  //Comprobar la extension: Si es correcta, guardar la imagen
  User.findOneAndUpdate(
    { _id: req.user.id },
    { image: req.file.filename },
    { new: true },
    (error, userUpdate) => {
      if (error || !userUpdate) {
        return res.status(500).send({
          status: "error",
          message: "Image cannot be updated",
        });
      }
      //Devolver la respuesta
      return res.status(200).send({
        status: "success",
        user: userUpdate,
        file: req.file,
      });
    }
  );
};

const avatar = (req, res) => {
  //Sacar el parametro de la url
  const file = req.params.file;
  //Montar un path para la imagen
  const filePath = `./uploads/avatars/${file}`;
  //Comprobar que existe
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res
        .status(404)
        .send({ status: "error", message: "Image does not exists" });
    }
    //Devolver un file
    return res.sendFile(path.resolve(filePath));
  });
};

const counters = async (req, res) => {
  let userId = req.user.id;
  if (req.params.id) {
    userId = req.params.id;
  }
  try {
    const following = await Follow.count({ user: userId });
    const followed = await Follow.count({ followed: userId });
    const publications = await Publication.count({ user: userId });
    return res.status(200).send({
      status: "success",
      userId,
      following: following,
      followed,
      publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Counter error",
      error,
    });
  }
};

//Exportar acciones
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counters,
};
