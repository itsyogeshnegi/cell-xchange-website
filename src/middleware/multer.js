import multer from "multer";

// Memory-only configuration for integrations that use Node request adapters.
// App Router route handlers use native FormData and the same size/type contract.
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, callback) => callback(null, ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)),
});
