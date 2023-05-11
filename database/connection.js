const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/my_social_network");
    console.log("Conectado correctamente a la db: my_social_network");
  } catch (error) {
    console.log(error);
    throw new Error("Cannot connect to the database");
  }
};
module.exports = connection;
