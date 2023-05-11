//Importacion de modulos
const fs = require("fs");
const path = require("path");
//Importacion de modelos
const Publication = require("../models/publication");
//Importar servicios
const followService = require("../services/followService");
//Acciones de prueba
const pruebaPubli = (req, res) => {
  return res
    .status(200)
    .send({ message: "Message send from controllers/publication.js" });
};

//Guardar publicacion
const save = (req, res) => {
  //Recoger datos del body
  const params = req.body;
  //Sino me llegan dar respuesta negativa
  if (!params.text) return res.status(400).send({ status: "error", message: "Not publication text" });
  //Crear y rellenar el objeto del modelo
  let newPublication = new Publication(params);
  newPublication.user = req.user.id;
  //Guardar objeto en la base de datos
  newPublication.save((error, publicationStored) => {
    if (error || !publicationStored) {
      return res
        .status(400)
        .send({ status: "error", message: "Publication not saved" });
    }
    return res.status(200).send({
      status: "success",
      message: "Publication saved",
      publicationStored,
    });
  });
};
//Sacar una publicacion
const detail = (req, res) => {
  //Sacar id de publicacion de la url
  const publicationId = req.params.id;
  //Find con la condicion del id
  Publication.findById(publicationId, (error, publicationStored) => {
    if (error || !publicationStored) {
      return res.status(404).send({
        status: "error",
        message: "Publication does not exist",
      });
    }
    //Devolver respuesta
    return res.status(200).send({
      status: "success",
      message: "Show publication",
      publication: publicationStored,
    });
  });
};
//Eliminar publicacion
const remove = (req, res) => {
  //Sacar el id de la publicacion a eliminar
  const publicationId = req.params.id;
  //Find y luego remove
  Publication.find({ user: req.user.id, _id: publicationId }).remove(
    (error) => {
      if (error) {
        //Devolver la respuesta
        return res.status(500).send({
          status: "error",
          message: "Error deleting",
        });
      }
      //Devolver la respuesta
      return res.status(200).send({
        status: "success",
        message: "Delete Publication",
        publication: publicationId,
      });
    }
  );
};
//Listar publicaciones de un usuario
const user = (req, res) => {
  //Sacar el id de usuario
  const userId = req.params.id;
  //Controlar la pagina
  let page = 1;
  if (req.params.page) page = req.params.page;

  const itemsPerPage = 5;
  //Find, populate, ordenar, paginar
  Publication.find({ user: userId })
    .sort("-created_at")
    .populate("user", "-password -__v -role -email")
    .paginate(page, itemsPerPage, (error, publications, total) => {
      if (error || !publications || publications.length <= 0) {
        return res.status(404).send({
          status: "error",
          message: "Not publications available",
        });
      }
      //Devolver la respuesta
      return res.status(200).send({
        status: "success",
        message: "User profile publication",
        page,
        total,
        pages: Math.ceil(total / itemsPerPage),
        publications,
      });
    });
};

//Subir ficheros
const upload = (req, res) => {
  //Sacar publication id
  const publicationId = req.params.id;
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
  Publication.findByIdAndUpdate(
    { user: req.user.id, _id: publicationId },
    { file: req.file.filename },
    { new: true },
    (error, publicationUpdate) => {
      if (error || !publicationUpdate) {
        return res.status(500).send({
          status: "error",
          message: "Image cannot be updated",
        });
      }
      //Devolver la respuesta
      return res.status(200).send({
        status: "success",
        publication: publicationUpdate,
        file: req.file,
      });
    }
  );
};
//Devolver archivos multimedia
const media = (req, res) => {
  //Sacar el parametro de la url
  const file = req.params.file;
  //Montar un path para la imagen
  const filePath = `./uploads/publications/${file}`;
  //Comprobar que existe
  fs.stat(filePath, (error, exist) => {
    if (!exist) {
      return res
        .status(404)
        .send({ status: "error", message: "Image does not exists" });
    }
    //Devolver un file
    return res.sendFile(path.resolve(filePath));
  });
};

//Listar todas la publicaciones (FEED)
const feed = async (req, res) => {
  //Sacar la pagina actual
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  //Establecer el numero de elementos por pagina
  let itemsPerPage = 5;
  //Sacar un array de identificadores de usuarios que yo sigo como usuario identificado
  try {
    const myFollows = await followService.followUserIds(req.user.id);
    //Find a publicacions in, ordernar, popular, paginar
    const publications = Publication.find({
      user: myFollows.following,
    })
      .populate("user", "-password -role -__v -email")
      .sort("-created_at")
      .paginate(page, itemsPerPage, (error, publications, total) => {
        if (error || !publications) {
          return res.status(400).send({
            status: "error",
            message: "Not publication available",
          });
        }
        //Devolver la respuesta
        return res.status(200).send({
          status: "success",
          message: "Publication feed",
          following: myFollows.following,
          total,
          page,
          pages: Math.ceil(total / itemsPerPage),
          publications,
        });
      });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Cannot list publications",
    });
  }
};

//Exportar acciones
module.exports = {
  pruebaPubli,
  save,
  detail,
  remove,
  user,
  upload,
  media,
  feed,
};
