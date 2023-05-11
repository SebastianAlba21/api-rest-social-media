const express = require("express");
const router = express.Router();
const multer = require("multer");
const publiController = require("../controllers/publication");
const check = require("../middlewares/auth");

//Configuracion de la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/publications/");
  },
  filename: (req, file, cb) => {
    cb(null, `pub-${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

//Definir rutas
router.get("/prueba-publi", publiController.pruebaPubli);
router.post("/save", check.auth, publiController.save);
router.get("/detail/:id", check.auth, publiController.detail);
router.delete("/remove/:id", check.auth, publiController.remove);
router.get("/user/:id/:page?", check.auth, publiController.user);
router.post(
  "/upload/:id",
  [check.auth, uploads.single("file0")],
  publiController.upload
);
router.get("/media/:file", publiController.media);
router.get("/feed/:page?", check.auth, publiController.feed);

//Exportar el router
module.exports = router;
