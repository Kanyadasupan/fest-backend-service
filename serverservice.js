const express = require("express");
const cors = require("cors");
const userRoute = require('./routes/user.route');
const festRoute = require('./routes/fest.route');

const app = express(); //สร้าง web server

require('dotenv').config();

const PORT = process.env.PORT;

//ใช้ตัว middleware
app.use(cors());
app.use(express.json());
app.use('/user', userRoute);
app.use('/fest',festRoute);
app.use("/images/users", express.static("images/users"));
app.use("/images/fests", express.static("images/fests"));

//เอาไว้เทสว่ารับ request/response ได้ไหม
app.get("/", (request, response) => {
    response.json({
      message: "Hello, welcome to server....Kanyada..",
    });
  });

//คำสั่งให้ web server เปิด PORT รองรับการ request/response ตามที่กำหนดไว้
app.listen(PORT, () => {
    // console.log("Server running on port " + PORT)
    // console.log('Server running on port ' + PORT)
    console.log(`Server running on port ${PORT}`);
  });