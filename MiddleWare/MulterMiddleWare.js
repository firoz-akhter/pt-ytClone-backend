import multer from "multer";

const storage = multer.memoryStorage(); // Store files in memory as Buffer objects

export const upload = multer({ storage: storage });
