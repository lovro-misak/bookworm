import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const safeFilename = `${base.replace(/[^a-z0-9]/gi, "_")}_${timestamp}${ext}`;
    cb(null, safeFilename);
  },
});

const upload = multer({ storage });

export default upload;
