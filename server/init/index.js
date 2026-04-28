import mongoose from "mongoose";
import initData from "./data.js";

const dbUrl = "mongodb://127.0.0.1:27017/Compiler";


const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  marks: Number,
  city: String,
  owner: String
});

const student = mongoose.model("student", studentSchema);


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
  await initDB();
}

const initDB = async () => {
  await student.deleteMany({});
  await student.insertMany(initData.data);

  console.log("data was initialized");
};
