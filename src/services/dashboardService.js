import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import { phones as demoPhones } from "@/lib/demo-data";
import Phone from "@/models/Phone";

const readStats = unstable_cache(async () => {
  await connectDB();
  const [stats] = await Phone.aggregate([
    { $facet: {
      totals: [{ $group: { _id: null, total: { $sum: 1 }, totalCost: { $sum: { $multiply: ["$price", "$stock"] } }, available: { $sum: { $cond: [{ $gt: ["$stock", 0] }, 1, 0] } }, outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } } } }],
      recent: [{ $sort: { createdAt: -1 } }, { $limit: 5 }, { $project: { brand: 1, model: 1, storage: 1, price: 1, stock: 1, images: { $slice: ["$images", 1] }, createdAt: 1 } }],
    } },
    { $project: { recent: 1, total: { $ifNull: [{ $first: "$totals.total" }, 0] }, totalCost: { $ifNull: [{ $first: "$totals.totalCost" }, 0] }, available: { $ifNull: [{ $first: "$totals.available" }, 0] }, outOfStock: { $ifNull: [{ $first: "$totals.outOfStock" }, 0] } } },
  ]).option({ maxTimeMS: 5000 });
  return JSON.parse(JSON.stringify(stats));
}, ["dashboard-stats"], { revalidate: 30, tags: ["phones"] });

export function getDashboardStats() {
  if (process.env.MONGODB_URI) return readStats();
  return {
    total: demoPhones.length,
    totalCost: demoPhones.reduce((sum, phone) => sum + phone.price * phone.stock, 0),
    available: demoPhones.filter((phone) => phone.stock > 0).length,
    outOfStock: demoPhones.filter((phone) => phone.stock === 0).length,
    recent: [...demoPhones].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
  };
}
