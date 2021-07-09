import mongoose from "mongoose";
import mainThread from "../mainThread";

const initDB = () => {
  mongoose
    .connect(
      "mongodb+srv://root:pass@cluster0.mygcu.mongodb.net/mongocrud?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true, family: 4 }
    )
    .then(() => {
      console.log("Aplicatação conectada ao banco de dados!");
      mainThread();
    })
    .catch((error) => {
      console.log(`Erro ao conectar com o banco: ${error}`);
    });
};

export default initDB;
