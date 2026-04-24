import express from "express";
import multer from "multer";
import { minioClient } from "../minio.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "File required" });
    }

    // contoh path rapi
    const objectName = `users/12/${Date.now()}-${file.originalname}`;

    await minioClient.putObject(
      process.env.MINIO_BUCKET,
      objectName,
      file.buffer,
      file.size,
      { "Content-Type": file.mimetype },
    );

    // ❌ JANGAN return URL PUBLIC
    // ✅ return objectName (path)

    res.json({
      message: "Upload success",
      path: objectName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
