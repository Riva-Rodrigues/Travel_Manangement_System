import multer from 'multer';
import path from 'path';

// Define storage for multer
const storage = multer.diskStorage({
  // Define the destination for storing uploaded files
  destination: function (req, file, cb) {
    // Resolve the absolute path to 'public/temp' directory
    cb(null, path.join(process.cwd(), './public/temp'));
  },
  // Define the filename for the uploaded files
  filename: function (req, file, cb) {
    // Generate a unique filename by adding a timestamp to the original file name
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Create multer instance with the defined storage and .array() method for handling multiple files
const upload = multer({ storage }).array('packageImages', 10);  // 'packageImages' is the name of the field for the uploaded files

export { upload };
