//จัดการ DB
const { PrismaClient } = require("@prisma/client");

//จัดการการ Upload
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { console } = require("console");

//? สร้างตัวแปรอ้างอิงสำหรับ prisma เพื่อเอาไปใช้
const prisma = new PrismaClient();

//? อัปโหลดไฟล์-----------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/users");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "user_" +
        Math.floor(Math.random() * Date.now()) +
        path.extname(file.originalname)
    );
  },
});

exports.uploadUser = multer({
  storage: storage,
  limits: {
    fileSize: 100000000,
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Error: Images Only");
  },
}).single("userImage"); //? ต้องตรงกับ column ในฐานข้อมูล

//? การเอาข้อมูลที่ส่งมาจาก Frontend เพิ่ม(Create/Insert) ลงตารางใน DB
exports.createUser = async (request, response) => {
  try {
    //-----
    const result = await prisma.user_tb.create({
      // .create ใช้สำหรับเพิ่ม (insert) ข้อมูล
      data: {
        userFullname: request.body.userFullname,
        userName: request.body.userName,
        userPassword: request.body.userPassword,
        userImage: request.file
          ? request.file.path.replace("images/users/", "")
          : "",
      },
    });
    //-----
    response.status(201).json({
      message: "OK",
      info: result,
    });
  } catch (error) {
    response.status(500).json({
      message: `พบปัญหาในการทำงาน: ${error}`,
    });
    console.log(`Error: ${error}`);
  }
};

//ตรวจสอบ User (GET) จากชื้อผู้ใช้และรหัสผ่าน กับตารางในdatabase
exports.checkLogin = async (request, response) => {
  try {
    //----
    const result = await prisma.user_tb.findFirst({
      where: {
        userName: request.params.userName,
        userPassword: request.params.userPassword,
      },
    });
    //-----
    if (result) {
      response.status(200).json({
        message: "Ok",
        info: result,
      });
    } else {
      response.status(404).json({
        message: "OK",
        info: result,
      });
    }
  } catch (error) {
    response.status(500).json({
      message: `พบปัญหาในการทำงาน: ${error}`,
    });
    console.log(`Error: ${error}`);
  }
};

//แก้ไข User (Update) ข้อมูลตารางในdatabase
exports.updateUser = async (request, response) => {
  try {
    let result = {};
    //----
    //ด้วยความที่มีการเก็บรูป เลยต้องมีการตรวจสอบก่อนว่า ข้อมูลนั้นมีรูปหรือไม่ ถ้าไม่มีรูปก็ไม่มีอะไร
    //แต่ถ้ามีรูป แล้วมีการอัปเดจรูป รูปที่มีอยู่เดิมจะถูกลบทิ้ง
    //ตรวจสอบว่าการแก้ไขนี้มีการอัปโหลดรูปมาเพื่อแก้ไขหรือไม่
    if (request.file) {
      //แก้ไขข้อมูลแบบแก้ไขรูปด้วย ต้องลบรูปเก่าออกก่อน
      //ดึงข้อมูลของ user คนที่จะแก้ไข
      const userResult = await prisma.user_tb.findFirst({
        where: {
          userId: parseInt(request.params.userId),
        },
      });
      //เอาข้อมูลของ user ที่ได้มามาดูว่ามีรูปไหม ถ้ามีให้ลบรูปนั้นทิ้ง
      if (userResult.userImage) {
        fs.unlinkSync(path.join("images/users", userResult.userImage)); //ลบรูปทิ้ง
      }
      //แก้ไขข้อมูลในฐานข้อมูล
      result = await prisma.user_tb.update({
        where: {
          userId: parseInt(request.params.userId),
        },
        data: {
          userFullname: request.body.userFullname,
          userName: request.body.userName,
          userPassword: request.body.userPassword,
          userImage: request.file.path.replace("images/users/", ""),
        },
      });
    } else {
      //แก้ไขข้อมูลแบบไม่มีการแก้ไขรูป
      result = await prisma.user_tb.update({
        where: {
          userId: parseInt(request.params.userId),
        },
        data: {
          userFullname: request.body.userFullname,
          userName: request.body.userName,
          userPassword: request.body.userPassword,
        },
      });
    }
    response.status(200).json({
      message: "Ok",
      info: result,
    });
  } catch (error) {
    response.status(500).json({
      message: `พบปัญหาในการทำงาน: ${error}`,
    });
    console.log(`Error: ${error}`);
  }
};
