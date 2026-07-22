import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

export function uploadImage(file) {
  return new Promise(async (resolve, reject) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = cloudinary.uploader.upload_stream({ folder: "mobile-hub/phones", resource_type: "image", transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }] }, (error, result) => error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id }));
    stream.end(buffer);
  });
}

export async function deleteImages(images = []) {
  const ids = images.map((image) => image.publicId).filter(Boolean);
  if (ids.length) await cloudinary.api.delete_resources(ids);
}
