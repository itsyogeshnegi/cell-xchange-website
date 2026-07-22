export const store = {
  name: "cell.xchange",
  phoneDisplay: "97 18 18 27 27",
  phoneE164: "+919718182727",
  email: "cell.xchange@icloud.com",
  hours: "12 p.m. – 10 p.m.",
  days: "Open all 7 days",
  addressLine1: "140/9, Kishan Garh, Vasant Kunj",
  addressLine2: "Opposite CNG Station, Near Gate No. 3, Gaushala Road",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=140%2F9%20Kishan%20Garh%20Vasant%20Kunj%20Gaushala%20Road",
  whatsappUrl: "https://wa.me/919718182727?text=Hi%20cell.xchange%2C%20I%27m%20interested%20in%20a%20phone.",
};

export function createStoreProfile(values = {}) {
  const profile = { ...store, ...values };
  const digits = String(profile.phoneDisplay || "").replace(/\D/g, "");
  profile.phoneE164 = digits.length === 10 ? `+91${digits}` : `+${digits}`;
  profile.whatsappUrl = `https://wa.me/${profile.phoneE164.replace("+", "")}?text=Hi%20${encodeURIComponent(profile.name)}%2C%20I%27m%20interested%20in%20a%20phone.`;
  return profile;
}
