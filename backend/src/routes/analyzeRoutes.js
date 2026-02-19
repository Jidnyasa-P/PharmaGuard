const express = require("express");
const router = express.Router();

const { upload, validateVCF } = require("../middlewares/uploadMiddleware");
const analyzeController = require("../controllers/analyzeController");

// POST /api/analyze
router.post(
  "/analyze",
  upload.single("file"),   // Accept VCF file from frontend
  validateVCF,             // Check VCF v4.2 format
  analyzeController.analyzeVCF
);

module.exports = router;
