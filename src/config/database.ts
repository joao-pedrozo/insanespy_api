import mongoose from "mongoose";

const initDB = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4,
    })
    .then(() => {
      console.log("Aplicatação conectada ao banco de dados!");
    })
    .catch((error) => {
      console.log(`Erro ao conectar com o banco: ${error}`);
    });
};

export default initDB;
