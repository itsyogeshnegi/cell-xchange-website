import * as XLSX from "xlsx";
import { connectDB } from "@/lib/db";
import { handleError, fail, requireAdmin } from "@/lib/api";
import { phones as demoPhones } from "@/lib/demo-data";
import { enforceRateLimit } from "@/lib/rate-limit";
import Phone from "@/models/Phone";

export async function GET(request) {
  try {
    await enforceRateLimit(request, { scope: "phones-export", limit: 30 });
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand")?.trim();
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const startDateStr = searchParams.get("startDate")?.trim();
    const endDateStr = searchParams.get("endDate")?.trim();

    // Date range validation rule: both are mandatory if either is selected
    if ((startDateStr && !endDateStr) || (!startDateStr && endDateStr)) {
      return fail("Both Start Date and End Date are required when filtering by date", 422);
    }

    let startDate, endDate;
    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return fail("Invalid date format provided", 422);
      }

      if (startDate > endDate) {
        return fail("Start Date must be before or equal to End Date", 422);
      }
    }

    let rawItems = [];

    if (!process.env.MONGODB_URI) {
      rawItems = demoPhones.filter((item) => {
        if (brand && brand !== "All" && item.brand !== brand) return false;
        if (minPrice && item.price < Number(minPrice)) return false;
        if (maxPrice && item.price > Number(maxPrice)) return false;
        if (startDate && endDate) {
          const itemDate = new Date(item.createdAt);
          if (itemDate < startDate || itemDate > endDate) return false;
        }
        return true;
      });
    } else {
      await connectDB();
      const filter = {};
      if (brand && brand !== "All") filter.brand = brand;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      if (startDate && endDate) {
        filter.createdAt = { $gte: startDate, $lte: endDate };
      }

      rawItems = await Phone.find(filter).sort({ createdAt: -1 }).lean().maxTimeMS(8000);
    }

    // Format rows for spreadsheet
    const rows = rawItems.map((item) => ({
        "Product ID": String(item._id),
        "Category": item.category || "Phone",
        "Brand": item.brand,
        "Model": item.model,
        "Storage": item.storage || "-",
        "RAM": item.ram || "-",
        "Colour": item.color || "-",
        "Price (₹)": item.price,
        "Stock": item.stock,
        "Status": item.stock > 0 ? "Available" : "Sold Out",
        "Condition": item.condition || "New",
        "IMEI 1": item.imei || "N/A",
        "IMEI 2": item.imei2 || "N/A",
        "Website Visible": item.visible !== false ? "Yes" : "No",
        "Image URL": item.images?.[0]?.url || "N/A",
        "All Image URLs": item.images?.length ? item.images.map((img) => img.url).join(", ") : "N/A",
        "Created Date": item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : "-",
      }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    // Set auto column widths
    const columnWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, 14),
    }));
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    const fileName = `cell_xchange_inventory_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
