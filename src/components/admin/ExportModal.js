"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download, FileSpreadsheet, LoaderCircle, X } from "lucide-react";
import { brands as defaultBrands } from "@/lib/demo-data";

export default function ExportModal({ isOpen, onClose, brands = defaultBrands }) {
  const [brand, setBrand] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [dateError, setDateError] = useState("");

  if (!isOpen) return null;

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    if ((val && !endDate) || (!val && endDate)) {
      setDateError("Both Start Date and End Date are mandatory when filtering by date.");
    } else {
      setDateError("");
    }
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    if ((startDate && !val) || (!startDate && val)) {
      setDateError("Both Start Date and End Date are mandatory when filtering by date.");
    } else {
      setDateError("");
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();

    // Enforce date validation: both mandatory if either is selected
    if ((startDate && !endDate) || (!startDate && endDate)) {
      const msg = "Both Start Date and End Date are mandatory when filtering by date.";
      setDateError(msg);
      toast.error(msg);
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      const msg = "Start Date must be before or equal to End Date.";
      setDateError(msg);
      toast.error(msg);
      return;
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      toast.error("Min Price cannot be greater than Max Price");
      return;
    }

    setDateError("");
    setDownloading(true);

    try {
      const params = new URLSearchParams();
      if (brand && brand !== "All") params.set("brand", brand);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (startDate && endDate) {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }

      const response = await fetch(`/api/phones/export?${params.toString()}`);
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Failed to generate Excel report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cell_xchange_inventory_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success("Excel report exported successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Could not export inventory");
    } finally {
      setDownloading(false);
    }
  };

  const resetFilters = () => {
    setBrand("All");
    setMinPrice("");
    setMaxPrice("");
    setStartDate("");
    setEndDate("");
    setDateError("");
  };

  const availableBrands = ["All", ...new Set(brands)];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="export-title" className="w-full max-w-lg rounded-[24px] border border-[#e1e4e1] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-[#eceeec] pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf7ef] text-[#173f2c]">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 id="export-title" className="text-xl font-black text-[#151915]">Export Inventory</h2>
              <p className="text-xs text-[#717a74]">Filter & download Excel report (.xlsx)</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="grid h-8 w-8 place-items-center rounded-full text-[#717a74] hover:bg-[#f0f2f0]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleExport} className="mt-6 space-y-5">
          {/* Brand Filter */}
          <div>
            <label className="block text-xs font-bold text-[#49504a]">Brand</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input mt-1.5 font-semibold">
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b === "All" ? "All Brands" : b}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold text-[#49504a]">Price Range (₹)</label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                placeholder="Min Price (₹)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input"
              />
              <input
                type="number"
                min="0"
                placeholder="Max Price (₹)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Date Range with mandatory pair validation */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#49504a]">Created Date Range</label>
              <span className="text-[10px] text-[#828a84]">*Both required if date filter is set</span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <div>
                <span className="mb-1 block text-[10px] font-semibold text-[#6e7670]">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className={`input ${dateError ? "border-red-400 bg-red-50/30" : ""}`}
                />
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-semibold text-[#6e7670]">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className={`input ${dateError ? "border-red-400 bg-red-50/30" : ""}`}
                />
              </div>
            </div>
            {dateError && <p className="mt-1.5 text-xs font-semibold text-red-600">{dateError}</p>}
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={resetFilters} className="text-xs font-bold text-[#717a74] underline-offset-4 hover:underline">
              Reset filters
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 rounded-full border border-[#dfe3df] px-5 py-3 text-xs font-bold sm:flex-none">
                Cancel
              </button>
              <button
                type="submit"
                disabled={downloading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#173f2c] px-6 py-3 text-xs font-bold text-white disabled:opacity-60 sm:flex-none"
              >
                {downloading ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download size={15} /> Export Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
