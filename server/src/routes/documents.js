const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const Document = require("../models/Document");

const router = express.Router();

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File filter to only accept PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload a document
router.post(
  "/upload",
  auth,
  upload.single("document"),
  async (req, res, next) => {
    try {
      const { name, subject, college } = req.body;

      if (!name || !subject || !college) {
        return res
          .status(400)
          .json({ error: "Name, subject, and college are required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const newDocument = new Document({
        name,
        subject,
        college,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: req.user.id,
      });

      await newDocument.save();

      res.status(201).json({
        message: "Document uploaded successfully",
        document: {
          id: newDocument._id,
          name: newDocument.name,
          subject: newDocument.subject,
          college: newDocument.college,
          fileName: newDocument.fileName,
          createdAt: newDocument.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get all documents with optional search
router.get("/", auth, async (req, res, next) => {
  try {
    const { search, subject, college } = req.query;
    let query = {};

    // If search term is provided, use text search
    if (search) {
      query.$text = { $search: search };
    }

    // Add filters if provided
    if (subject) {
      query.subject = subject;
    }
    if (college) {
      query.college = college;
    }

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .select("-filePath -__v")
      .populate("uploadedBy", "name email");

    res.status(200).json({ documents });
  } catch (err) {
    next(err);
  }
});

// Get a single document by ID
router.get("/:id", auth, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "uploadedBy",
      "name email"
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json({ document });
  } catch (err) {
    next(err);
  }
});

// Download a document
router.get("/:id/download", auth, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.download(document.filePath, document.fileName);
  } catch (err) {
    next(err);
  }
});

// Delete a document
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Check if user is the owner
    if (document.uploadedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this document" });
    }

    // Delete file from filesystem
    fs.unlink(document.filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }

      // Delete document from database
      await Document.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Document deleted successfully" });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;