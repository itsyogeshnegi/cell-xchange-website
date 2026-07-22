import { slugify } from "@/utils/format";

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const publicPhoneFields = "category brand model slug description price discount color storage ram battery processor display camera condition stock featured latest visible images createdAt updatedAt";
export const safeString = (value, max = 80) => String(value || "").trim().slice(0, max);

export function parsePhoneForm(form) {
  const number = (key) => Number(form.get(key) || 0);
  return {
    category: safeString(form.get("category")) || "Phone",
    brand: safeString(form.get("brand")), model: safeString(form.get("model")),
    slug: slugify(safeString(form.get("slug") || form.get("model"))),
    description: safeString(form.get("description"), 4000), price: number("price"), discount: number("discount"),
    color: safeString(form.get("color")), storage: safeString(form.get("storage")), ram: safeString(form.get("ram")),
    battery: safeString(form.get("battery")), processor: safeString(form.get("processor")), display: safeString(form.get("display")), camera: safeString(form.get("camera")),
    condition: safeString(form.get("condition")) || "New", imei: safeString(form.get("imei"), 32) || undefined,
    stock: number("stock"), featured: form.get("featured") === "true", latest: form.get("latest") === "true", visible: form.get("visible") !== "false",
  };
}

export function validateImageFiles(files, required = true) {
  if (required && files.length < 2) throw Object.assign(new Error("Upload at least two product images"), { status: 422 });
  if (!required && files.length === 1) throw Object.assign(new Error("Upload at least two images when replacing product photos"), { status: 422 });
  if (files.length > 8 || files.some((file) => file.size > 8 * 1024 * 1024 || !allowedImageTypes.includes(file.type))) {
    throw Object.assign(new Error("Use up to 8 JPG, PNG, WebP, or AVIF images under 8MB"), { status: 422 });
  }
}
