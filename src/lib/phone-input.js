import { slugify } from "@/utils/format";

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const publicPhoneFields = "category brand model slug description price color country storage ram battery processor display camera accessories warrantyStatus condition status stock featured latest visible images createdAt updatedAt";
export const safeString = (value, max = 80) => String(value || "").trim().slice(0, max);

export function parsePhoneForm(form) {
  const number = (key) => Number(form.get(key) || 0);
  const brand = safeString(form.get("brand"));
  const accessories = safeString(form.get("accessories"), 1000)
    .split(",")
    .map((item) => safeString(item, 80))
    .filter(Boolean)
    .slice(0, 20);
  return {
    category: safeString(form.get("category")) || undefined,
    brand: brand === "__custom__" ? undefined : brand, model: safeString(form.get("model")),
    slug: slugify(safeString(form.get("slug") || form.get("model"))),
    description: safeString(form.get("description"), 4000), price: form.get("price") === null || form.get("price") === "" ? undefined : number("price"),
    color: safeString(form.get("color")), country: safeString(form.get("country")), storage: safeString(form.get("storage")), ram: safeString(form.get("ram")),
    battery: safeString(form.get("battery")), processor: safeString(form.get("processor")), display: safeString(form.get("display")), camera: safeString(form.get("camera")),
    accessories,
    warrantyStatus: safeString(form.get("warrantyStatus"), 120) || "Not specified",
    condition: safeString(form.get("condition")) || undefined,
    status: safeString(form.get("status")) || undefined,
    imei: safeString(form.get("imei"), 15) || undefined,
    imei2: safeString(form.get("imei2"), 15) || undefined,
    featured: form.get("featured") === "true", latest: form.get("latest") === "true", visible: form.get("visible") !== "false",
  };
}

export function validateImageFiles(files, required = true) {
  if (required && files.length < 1) throw Object.assign(new Error("Upload at least one product image"), { status: 422 });
  if (files.length > 3 || files.some((file) => file.size > 8 * 1024 * 1024 || !allowedImageTypes.includes(file.type))) {
    throw Object.assign(new Error("Use 1 to 3 JPG, PNG, WebP, or AVIF images under 8MB"), { status: 422 });
  }
}
