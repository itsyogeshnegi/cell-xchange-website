export const productCategories = ["Phone", "Laptop", "Smartwatch", "iPad & Tabs", "Accessories"];

export const defaultBrandsByCategory = {
  Phone: ["Apple", "Samsung", "Google", "OnePlus", "Nothing", "Xiaomi", "Redmi", "Realme", "Motorola", "Oppo", "Vivo", "Nokia", "Honor", "Sony", "Huawei", "Infinix", "Tecno"],
  Laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Microsoft", "Samsung", "LG", "Huawei", "Razer"],
  Smartwatch: ["Apple", "Samsung", "Google", "Garmin", "Amazfit", "Fitbit", "Huawei", "OnePlus", "Xiaomi", "Noise", "boAt", "Fossil"],
  "iPad & Tabs": ["Apple", "Samsung", "Lenovo", "Xiaomi", "OnePlus", "Huawei", "Honor", "Realme", "Amazon", "Microsoft", "Nokia"],
  Accessories: ["Apple", "Samsung", "Sony", "Bose", "JBL", "Logitech", "Belkin", "Anker", "boAt", "Noise", "Spigen", "UGREEN", "Xiaomi", "OnePlus"],
};

export const normalizeBrandName = (value = "") => String(value).trim().replace(/\s+/g, " ").slice(0, 80);
export const normalizeBrandKey = (value = "") => normalizeBrandName(value).toLocaleLowerCase("en");

