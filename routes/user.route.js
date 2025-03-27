const express = require("express");
const userController = require("./../controllers/user.controller");

const route = express.Router();

//การกำหนดวิธีการเรียกใช้ API (กำหนด end-point)
//เพิ่ม ใช้ POST
route.post("/", userController.uploadUser, userController.createUser);

//ค้นหา ตรวจสอบ ดึง ดู ใช้ GET
route.get("/:userName/:userPassword", userController.checkLogin);

//แก้ไข ใช้ PUT
route.put("/:userId", userController.uploadUser, userController.updateUser);

module.exports = route;