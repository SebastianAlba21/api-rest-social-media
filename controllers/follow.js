//Importaciones
const Follow = require("../models/follow");
const User = require("../models/user");
const mongoosePaginate = require("mongoose-pagination");
//Importarmos el servicio
const followService = require("../services/followService");
//Acciones de prueba
const pruebaFollow = (req, res) => {
  return res
    .status(200)
    .send({ message: "Message send from controllers/follow.js" });
};

//Accion de "Seguir"
const save = (req, res) => {
  //Conseguir datos por el body
  const params = req.body;
  //Sacar id del usuario identificado
  const identity = req.user;
  //Crear objeto con modelo follow
  let userToFollow = new Follow({
    user: identity.id,
    followed: params.followed,
  });
  //Guardar objeto en base de datos
  userToFollow.save((error, followStored) => {
    if (error || !followStored) {
      return res.status(500).send({
        status: "error",
        message: "Cannot follow the user",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Follow method",
      identity: req.user,
      follow: followStored,
    });
  });
};
//Dejar de "Seguir"
const unfollow = (req, res) => {
  //Recoger el id del usuario identificado
  const userId = req.user.id;
  // Recoger el id del usuario que sigo y quiero dejar de seguir
  const followedId = req.params.id;
  //Find de las coincidencias
  Follow.find({
    user: userId,
    followed: followedId,
  }).remove((error, followDeleted) => {
    if (error || !followDeleted) {
      return res.status(500).send({
        status: "error",
        message: "Error Unfollow",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Successful unfollow",
    });
  });
};

//Listado de usuarios que estoy siguiendo
const following = (req, res) => {
  //Sacar el id del usuario identificado
  let userId = req.user.id;
  //Comprobar si me llega el parametr id
  if (req.params.id) userId = req.params.id;
  //Comprobar si me llega la pagina
  let page = 1;
  if (req.params.page) page = req.params.page;
  //Cuantos elementos por pagina
  const itemsPerPage = 5;
  //Find a follows
  Follow.find({
    user: userId,
  })
    .populate("user follower", "-password -role -__v -email")
    .paginate(page, itemsPerPage, async (error, follows, total) => {
      //Listado de ids de los usuarios que me siguen, como identificado
      //Listado de quien estoy siguiendo como identificado
      let followUserId = await followService.followUserIds(req.user.id);
      return res.status(200).send({
        status: "success",
        message: "Followed list",
        follows,
        total,
        pages: Math.ceil(total / itemsPerPage),
        user_following: followUserId.following,
        user_follow_me: followUserId.followers,
      });
    });
};

//Listado de usuarios que me siguen
const followers = (req, res) => {
  //Sacar el id del usuario identificado
  let userId = req.user.id;
  //Comprobar si me llega el parametr id
  if (req.params.id) userId = req.params.id;
  //Comprobar si me llega la pagina
  let page = 1;
  if (req.params.page) page = req.params.page;
  //Cuantos elementos por pagina
  const itemsPerPage = 5;
  //Find a follows
  Follow.find({
    followed: userId,
  })
    .populate("user", "-password -role -__v -email")
    .paginate(page, itemsPerPage, async (error, follows, total) => {
      let followUserId = await followService.followUserIds(req.user.id);
      return res.status(200).send({
        status: "success",
        message: "Following list",
        follows,
        total,
        pages: Math.ceil(total / itemsPerPage),
        user_following: followUserId.following,
        user_follow_me: followUserId.followers,
      });
    });
};
//Exportar acciones
module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
