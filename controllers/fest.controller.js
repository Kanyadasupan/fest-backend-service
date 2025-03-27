//จัดการ DB
const { PrismaClient } = require('@prisma/client');

//จัดการการ Upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Console } = require("console");

// สร้างตัวแปรอ้างอิงสำหรับ prisma เพื่อเอาไปใช้งาน
const prisma = new PrismaClient();

// อัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/fests");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "fest_" +
        Math.floor(Math.random() * Date.now()) +
        path.extname(file.originalname)
    );
  },
});
exports.uploadFest = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
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
}).single("festImage");//? ต้องตรงกับ column ในฐานข้อมูล


//? การเอาข้อมูลที่ส่งมาจาก Frontend เพิ่ม(Create/Insert) ลงตารางใน DB
exports.createFest = async (request, response) => {
  try {
    const result = await prisma.fest_tb.create({
      data: {
        festName: request.body.festName,
        festDetail: request.body.festDetail,
        festState: request.body.festState,
        festCost: parseFloat(request.body.festCost),
        userId: parseInt(request.body.userId),
        festNumDay: parseInt(request.body.festNumDay),
        festImage: request.file
          ? request.file.path.replace("images\\fests\\", "")
          : "",
      },
    });

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

//ดึงข้อมูล Fest ทั้งหมดของ User หนึ่งๆ จากตาราง ใน DB
exports.getAllFestByUser = async (request, response) => {
  try {
    const result = await prisma.fest_tb.findMany({
      where: {
        userId: parseInt(request.params.userId),
      },
    });

    response.status(200).json({
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

//ดึงข้อมูล Fest หนึ่งๆ เพื่อจะเอาไป ..... เช่น แก้ไข เป็นต้น
exports.getOnlyFest = async (request, response) => {
  try {
    const result = await prisma.fest_tb.findFirst({
      where: {
        festId: parseInt(request.params.festId),
      },
    });

    response.status(200).json({
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

exports.updateFest = async (request, response) => {
  try {
    let result = {};
    //----
    if (request.file) {
      const festResult = await prisma.fest_tb.findFirst({
        where: {
          festId: parseInt(request.params.festId),
        },
      });

      if (festResult.festImage) {
        fs.unlinkSync(path.join("images/fests", festResult.festImage)); //ลบรูปทิ้ง
      }

      //แก้ไขข้อมูลในฐานข้อมูล
      result = await prisma.fest_tb.update({
        where: {
          festId: parseInt(request.params.festId),
        },
        data: {
          festName: request.body.festName,
          festDetail: request.body.festDetail,
          festState: request.body.festState,
          festCost: parseFloat(request.body.festCost),
          userId: parseInt(request.body.userId),
          festNumDay: parseInt(request.body.festNumDay),
          festImage: request.file.path.replace("images/fests/", ""),
        },
      });
    } else {
      //แก้ไขข้อมูลแบบไม่มีการแก้ไขรูป
      result = await prisma.fest_tb.update({
        where: {
          festId: parseInt(request.params.festId),
        },
        data: {
          festName: request.body.festName,
          festDetail: request.body.festDetail,
          festState: request.body.festState,
          festCost: parseFloat(request.body.festCost),
          userId: parseInt(request.body.userId),
          festNumDay: parseInt(request.body.festNumDay),
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

//ลบ Fest หนึ่งๆ
exports.deleteFest = async (request, response) => {
  try {
    const result = await prisma.fest_tb.delete({
      where: {
        festId: parseInt(request.params.festId),
      },
    });

    response.status(200).json({
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