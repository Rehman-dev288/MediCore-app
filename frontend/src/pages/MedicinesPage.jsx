import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import MedicineCard from "../components/MedicineCard";
import api from "../lib/api";

export default function MedicinesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort_by: sortBy };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await api.get("/medicines", { params });
      setMedicines(res.data.medicines);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sortBy]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  useEffect(() => {
    api
      .get("/medicines/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const s = searchParams.get("search");
    const c = searchParams.get("category");
    if (s) setSearch(s);
    if (c) setCategory(c);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSortBy("name");
    setPage(1);
    setSearchParams({});
  };

  const hasFilters = search || category;

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="medicines-page"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Medicines
        </h1>
        <p className="text-base text-slate-500 mt-1">
          Browse our complete catalog of medicines and healthcare products
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              data-testid="medicines-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand..."
              className="pl-10 h-11 rounded-lg"
            />
          </div>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 h-11 px-5 rounded-lg"
            data-testid="medicines-search-btn"
          >
            Search
          </Button>
        </form>
        <div className="flex gap-2">
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="w-48 h-11 bg-white border-slate-200 text-[#0F1729] hover:bg-slate-50 transition-colors rounded-lg font-medium outline-none"
              data-testid="category-filter"
            >
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem
                value="all"
                className="text-[#0F1729] hover:bg-slate-100 cursor-pointer"
              >
                All Categories
              </SelectItem>
              {categories.map((c) => (
                <SelectItem
                  key={c}
                  value={c}
                  className="text-[#0F1729] hover:bg-slate-100 cursor-pointer"
                >
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className="w-36 h-11 bg-white border-slate-200 text-[#0F1729] hover:bg-slate-50 transition-colors rounded-lg font-medium outline-none"
              data-testid="sort-filter"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem
                value="name"
                className="text-[#0F1729] hover:bg-slate-100 cursor-pointer"
              >
                Name
              </SelectItem>
              <SelectItem
                value="price"
                className="text-[#0F1729] hover:bg-slate-100 cursor-pointer"
              >
                Price
              </SelectItem>
              <SelectItem
                value="brand"
                className="text-[#0F1729] hover:bg-slate-100 cursor-pointer"
              >
                Brand
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-slate-500">Filters:</span>
          {search && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => {
                setSearch("");
                setSearchParams((prev) => {
                  prev.delete("search");
                  return prev;
                });
              }}
            >
              {search} <X className="w-3 h-3" />
            </Badge>
          )}
          {category && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => {
                setCategory("");
                setSearchParams((prev) => {
                  prev.delete("category");
                  return prev;
                });
              }}
            >
              {category} <X className="w-3 h-3" />
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      <p className="text-sm text-slate-500 mb-4">
        {total} {total === 1 ? "product" : "products"} found
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-100" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-slate-700 mb-1">
            No medicines found
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="rounded-full"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {medicines.map((med) => (
            <MedicineCard key={med.id} medicine={med} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full px-5 hover:bg-slate-100 hover:text-[#0F1729] transition-all border-slate-200"
            data-testid="prev-page"
          >
            Previous
          </Button>

          {[...Array(pages)].map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(i + 1)}
              className={`rounded-full w-10 h-10 p-0 transition-all font-semibold ${
                page === i + 1
                  ? "bg-blue-600 text-white hover:bg-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-[#0F1729]" // Inactive with grey hover
              }`}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full px-5 hover:bg-slate-100 hover:text-[#0F1729] transition-all border-slate-200"
            data-testid="next-page"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
