const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads/vcfFiles");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File Filter (Only .vcf allowed)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext !== ".vcf") {
    return cb(new Error("Only VCF files are allowed"));
  }

  cb(null, true);
};

// Upload Middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// VCF v4.2 Validator Middleware
const validateVCF = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "VCF file is required",
      });
    }

    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, "utf-8");

    // Check for VCF v4.2 header
    if (!content.includes("##fileformat=VCFv4.2")) {
      return res.status(400).json({
        error: "Invalid VCF file. Must be VCF v4.2 format.",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      error: "Error validating VCF file",
    });
  }
};

module.exports = {
  upload,
  validateVCF,
};
