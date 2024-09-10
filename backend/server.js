const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware to parse incoming form data
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' folder

const UPLOAD_FOLDER = 'uploads';
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_FOLDER)));

// Set up the storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const className = req.body[file.fieldname];
    const dir = path.join(__dirname, "uploads", className);

    // Create class-specific directory if it doesn't exist
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const className = req.body[file.fieldname];
    const dir = path.join(__dirname, "uploads", className);

    // Get the current count of files in the directory to name the new file
    fs.readdir(dir, (err, files) => {
      if (err) throw err;
      const newFileName = `${files.length}.jpg`;
      cb(null, newFileName);
    });
  },
});

// Handle dynamic fields (any number of images from different classes)
const upload = multer({ storage: storage }).any();

// Route to handle the image upload
app.post("/predict", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Images uploaded successfully!" });
  });
});

// Serve index.html on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
