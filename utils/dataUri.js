import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
    const parser = new DataUriParser();
    const extName = path.extname(file?.originalname).toString(); // Corrected property
    if (!file.buffer) {
        throw new Error("File buffer is undefined");
    }
    
    return parser.format(extName, file.buffer); // Assuming you're using Multer's buffer storage
}

export default getDataUri;
