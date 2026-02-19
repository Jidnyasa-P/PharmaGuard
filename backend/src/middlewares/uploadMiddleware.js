const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads/vcfFiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  // Accept .vcf and .txt (some VCF files are renamed .txt)
  if (ext !== ".vcf" && ext !== ".txt") {
    return cb(new Error("Only VCF files (.vcf or .txt) are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const validateVCF = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "VCF file is required" });
    }

    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, "utf-8");

    // Accept VCFv4.1, v4.2, v4.3 or generic VCF headers
    if (!content.includes("##fileformat=VCF")) {
      return res.status(400).json({
        error: "Invalid VCF file. File must contain ##fileformat=VCF header. Please upload a valid VCF v4.2 file.",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "Error validating VCF file: " + err.message });
  }
};

module.exports = { upload, validateVCF };
