import { diskStorage } from "multer";
import { extname } from "path";

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads', // Folder for storing files
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname); // Extract file extension
      cb(null, `${uniqueSuffix}${ext}`); // Save with unique name
    },
  }),
};