import { connectDB } from "@/lib/db";
import { defaultBrandsByCategory, normalizeBrandKey, normalizeBrandName, productCategories } from "@/lib/brands";
import Brand from "@/models/Brand";
import Phone from "@/models/Phone";

const serialize = (value) => JSON.parse(JSON.stringify(value));
const seedState = global.brandCatalogSeedState || { promise: null, uri: null };
global.brandCatalogSeedState = seedState;

function cloneDefaultCatalog() {
  return Object.fromEntries(productCategories.map((category) => [category, [...defaultBrandsByCategory[category]]]));
}

function defaultBrandOperations() {
  const brands = new Map();
  for (const [category, names] of Object.entries(defaultBrandsByCategory)) {
    for (const name of names) {
      const normalizedName = normalizeBrandKey(name);
      const entry = brands.get(normalizedName) || { name, categories: [] };
      entry.categories.push(category);
      brands.set(normalizedName, entry);
    }
  }

  return [...brands.entries()].map(([normalizedName, brand]) => ({
    updateOne: {
      filter: { normalizedName },
      update: {
        $setOnInsert: { name: brand.name, normalizedName, active: true },
        $addToSet: { categories: { $each: brand.categories } },
      },
      upsert: true,
    },
  }));
}

export async function ensureDefaultBrands() {
  if (!process.env.MONGODB_URI) return;
  const uri = process.env.MONGODB_URI;
  if (!seedState.promise || seedState.uri !== uri) {
    seedState.uri = uri;
    seedState.promise = (async () => {
      await connectDB();
      try {
        await Brand.bulkWrite(defaultBrandOperations(), { ordered: false });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }

      const existingBrands = await Phone.aggregate([
        { $match: { brand: { $type: "string", $ne: "" }, category: { $in: productCategories } } },
        { $group: { _id: { brand: "$brand", category: "$category" } } },
      ]).option({ maxTimeMS: 5000 });

      const operations = existingBrands.map(({ _id }) => {
        const name = normalizeBrandName(_id.brand);
        const normalizedName = normalizeBrandKey(name);
        return {
          updateOne: {
            filter: { normalizedName },
            update: {
              $setOnInsert: { name, normalizedName, active: true },
              $addToSet: { categories: _id.category },
            },
            upsert: true,
          },
        };
      });
      if (operations.length) {
        try {
          await Brand.bulkWrite(operations, { ordered: false });
        } catch (error) {
          if (error.code !== 11000) throw error;
        }
      }
    })().catch((error) => {
      seedState.promise = null;
      seedState.uri = null;
      throw error;
    });
  }
  await seedState.promise;
}

export async function getBrandCatalog() {
  if (!process.env.MONGODB_URI) return cloneDefaultCatalog();
  await ensureDefaultBrands();
  const brands = await Brand.find({ active: true })
    .select("name categories")
    .sort({ name: 1 })
    .lean()
    .maxTimeMS(5000);

  const catalog = Object.fromEntries(productCategories.map((category) => [category, []]));
  for (const brand of brands) {
    for (const category of brand.categories) {
      if (catalog[category]) catalog[category].push(brand.name);
    }
  }
  return serialize(catalog);
}

export async function registerBrand(name, category) {
  const cleanName = normalizeBrandName(name);
  if (!cleanName || !productCategories.includes(category)) {
    throw Object.assign(new Error("Choose a valid product type and brand"), { status: 422 });
  }
  if (!process.env.MONGODB_URI) return { name: cleanName, categories: [category] };

  await connectDB();
  return Brand.findOneAndUpdate(
    { normalizedName: normalizeBrandKey(cleanName) },
    {
      $setOnInsert: { name: cleanName, normalizedName: normalizeBrandKey(cleanName), active: true },
      $addToSet: { categories: category },
    },
    { new: true, upsert: true, runValidators: true },
  ).select("name categories").lean().maxTimeMS(5000);
}
