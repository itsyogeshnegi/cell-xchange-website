export const deviceFilterOptions = [
  { value: "All", label: "All devices" },
  { value: "iPhones", label: "iPhones" },
  { value: "Android Phones", label: "Android Phones" },
  { value: "Laptops", label: "Laptops" },
  { value: "iPad & Tabs", label: "iPad & Tabs" },
  { value: "Watches & Gadgets", label: "Watches & Gadgets" },
  { value: "Accessories", label: "Accessories" },
];

export const deviceFilterValues = deviceFilterOptions.slice(1).map(({ value }) => value);

export function applyDeviceFilter(filter, device) {
  if (device === "iPhones") {
    filter.category = "Phone";
    filter.brand = "Apple";
  }
  if (device === "Android Phones") {
    filter.category = "Phone";
    filter.brand = { $ne: "Apple" };
  }
  if (device === "Laptops") filter.category = "Laptop";
  if (device === "iPad & Tabs") filter.category = "iPad & Tabs";
  if (device === "Watches & Gadgets") filter.category = "Smartwatch";
  if (device === "Accessories") filter.category = "Accessories";
}

export function matchesDeviceFilter(phone, device) {
  if (!device || device === "All") return true;
  if (device === "iPhones") return phone.category === "Phone" && phone.brand === "Apple";
  if (device === "Android Phones") return phone.category === "Phone" && phone.brand !== "Apple";
  if (device === "Laptops") return phone.category === "Laptop";
  if (device === "iPad & Tabs") return phone.category === "iPad & Tabs";
  if (device === "Watches & Gadgets") return phone.category === "Smartwatch";
  return device === "Accessories" && phone.category === "Accessories";
}
