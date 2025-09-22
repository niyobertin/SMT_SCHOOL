import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadFile = upload.fields([
  { name: "fileVideo", maxCount: 1 },
  { name: "fileAudio", maxCount: 1 },
  { name: "filePDF", maxCount: 1 },
  { name: "fileImage", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "companyLogo", maxCount: 1 },
]);
