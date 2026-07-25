import mongoose from "mongoose";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import { phones as demoPhones } from "@/lib/demo-data";
import Phone from "@/models/Phone";

const PUBLIC_FIELDS = "category brand model slug description price discount color storage ram battery processor display camera condition stock featured latest visible images createdAt updatedAt";
const serialize = (value) => JSON.parse(JSON.stringify(value));

const readCachedPhones = (filter, limit) =>
  unstable_cache(
    async () => {
      await connectDB();
      let query = Phone.find(filter).select(PUBLIC_FIELDS).sort({ createdAt: -1 }).lean().maxTimeMS(5000);
      if (limit) query = query.limit(limit);
      return serialize(await query);
    },
    ["phone-catalog", JSON.stringify(filter), String(limit)],
    { revalidate: 60, tags: ["phones"] }
  )();

const readCachedPhone = (id) =>
  unstable_cache(
    async () => {
      await connectDB();
      const filter = { ...(mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }), visible: { $ne: false } };
      return serialize(await Phone.findOne(filter).select(PUBLIC_FIELDS).lean().maxTimeMS(5000));
    },
    ["phone-detail", String(id)],
    { revalidate: 60, tags: ["phones"] }
  )();

const readCachedPage = (options) =>
  unstable_cache(
    async () => {
      await connectDB();
      const filter = options.admin ? {} : { visible: { $ne: false } };
      if (options.q) filter.$text = { $search: options.q };
      if (options.brand) filter.brand = options.brand;
      if (options.storage) filter.storage = options.storage;
      const sort = options.sortName === "price-asc" ? { price: 1, _id: 1 } : options.sortName === "price-desc" ? { price: -1, _id: -1 } : { createdAt: -1, _id: -1 };
      const [items, total] = await Promise.all([
        Phone.find(filter).select(PUBLIC_FIELDS).sort(sort).skip((options.page - 1) * options.limit).limit(options.limit).lean().maxTimeMS(5000),
        Phone.countDocuments(filter).maxTimeMS(5000),
      ]);
      return serialize({ items, total, page: options.page, pages: Math.max(1, Math.ceil(total / options.limit)) });
    },
    ["phone-page", JSON.stringify(options)],
    { revalidate: 30, tags: ["phones"] }
  )();

const readCachedFacets = unstable_cache(async () => {
  await connectDB();
  const visible = { visible: { $ne: false } };
  const [brands, storages] = await Promise.all([Phone.distinct("brand", visible).maxTimeMS(5000), Phone.distinct("storage", visible).maxTimeMS(5000)]);
  return { brands: brands.sort(), storages: storages.sort() };
}, ["phone-facets"], { revalidate: 300, tags: ["phones"] });

export async function getPhones(filter = {}, limit = 12) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 12), 50);
  if (!process.env.MONGODB_URI) {
    return demoPhones.filter((phone) => Object.entries(filter).every(([key, value]) => phone[key] === value)).slice(0, safeLimit);
  }
  return readCachedPhones({ visible: { $ne: false }, ...filter }, safeLimit);
}

export async function getPhone(id, { admin = false } = {}) {
  if (!process.env.MONGODB_URI) return demoPhones.find((phone) => phone._id === id || phone.slug === id) || null;
  if (!admin) return readCachedPhone(id);
  await connectDB();
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  return serialize(await Phone.findOne(filter).lean().maxTimeMS(5000));
}

export async function getPhonePage({ page = 1, limit = 12, q = "", brand = "", storage = "", sort = "newest", admin = false } = {}) {
  const options = { page: Math.min(500, Math.max(1, page)), limit: Math.min(24, Math.max(1, limit)), q, brand, storage, sortName: sort, admin };
  if (!process.env.MONGODB_URI) {
    let items = demoPhones.filter((phone) => (!q || `${phone.brand} ${phone.model}`.toLowerCase().includes(q.toLowerCase())) && (!brand || phone.brand === brand) && (!storage || phone.storage === storage));
    items.sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : new Date(b.createdAt) - new Date(a.createdAt));
    const total = items.length;
    items = items.slice((options.page - 1) * options.limit, options.page * options.limit);
    return { items, total, page: options.page, pages: Math.max(1, Math.ceil(total / options.limit)) };
  }
  return readCachedPage(options);
}

export async function getPhoneFacets({ admin = false } = {}) {
  if (!process.env.MONGODB_URI) return { brands: [...new Set(demoPhones.map((phone) => phone.brand))], storages: [...new Set(demoPhones.map((phone) => phone.storage))] };
  if (admin) {
    await connectDB();
    const [brands, storages] = await Promise.all([Phone.distinct("brand").maxTimeMS(5000), Phone.distinct("storage").maxTimeMS(5000)]);
    return { brands: brands.sort(), storages: storages.sort() };
  }
  return readCachedFacets();
}

export async function getBrandStats() {
  if (!process.env.MONGODB_URI) {
    const counts = {};
    demoPhones.forEach((p) => { counts[p.brand] = (counts[p.brand] || 0) + 1; });
    return counts;
  }
  await connectDB();
  const aggregated = await Phone.aggregate([
    { $group: { _id: "$brand", count: { $sum: 1 } } }
  ]).option({ maxTimeMS: 5000 });
  const counts = {};
  aggregated.forEach((item) => { if (item._id) counts[item._id] = item.count; });
  return counts;
}

