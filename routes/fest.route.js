const express = require("express");
const festController = require("../controllers/fest.controller");
const route = express.Router();

//เพิ่ม
route.post('/', festController.uploadFest, festController.createFest);

//ค้นหา ตรวจสอบ ดึง ดู
route.get("/:userId", festController.getAllFestByUser);
route.get("/only/:festId", festController.getOnlyFest);

//แก้ไข
route.put("/:festId", festController.uploadFest, festController.updateFest);

//ลบ
route.delete("/:festId", festController.deleteFest);

module.exports = route;