import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  AlertTriangle,
  Pill,
  FileText,
  ShieldCheck,
  Info,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { toast } from "sonner";
import api from "../lib/api";
import MedicineCard from "../components/MedicineCard";

export default function MedicineDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/medicines/${id}`)
      .then((res) => {
        let incomingData = res.data;
        if (typeof incomingData.side_effects === "string") {
          try {
            incomingData.side_effects = JSON.parse(incomingData.side_effects);
          } catch (e) {
            incomingData.side_effects = incomingData.side_effects
              .split(",")
              .map((s) => s.trim());
          }
        }
        if (typeof incomingData.interactions === "string") {
          try {
            incomingData.interactions = JSON.parse(incomingData.interactions);
          } catch (e) {
            incomingData.interactions = incomingData.interactions
              .split(",")
              .map((s) => s.trim());
          }
        }
        setMedicine(incomingData);
        api
          .get(
            `/medicines?category=${encodeURIComponent(res.data.category)}&limit=5`,
          )
          .then((r) =>
            setRelated(r.data.medicines.filter((m) => m.id !== id).slice(0, 4)),
          )
          .catch(() => {});
      })
      .catch(() => toast.error("Medicine not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const needsPrescription =
    medicine?.is_prescription_required === 1 ||
    medicine?.requires_prescription === true;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      return;
    }
    try {
      await addToCart(medicine.id, qty);
      toast.success(`${medicine.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add to cart");
    }
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/3" />
            <div className="h-8 bg-slate-100 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        </div>
      </div>
    );

  if (!medicine)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-slate-500">Medicine not found</p>
        <Link to="/medicines">
          <Button variant="outline" className="mt-4 rounded-full">
            Back to Medicines
          </Button>
        </Link>
      </div>
    );

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="medicine-detail-page"
    >
      <Link
        to="/medicines"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        data-testid="back-to-medicines"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Medicines
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 aspect-square flex items-center justify-center">
          <img
            src={medicine.image_url}
            alt={medicine.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className="text-xs rounded-full px-3 bg-slate-100 text-slate-600 border-none"
              >
                {medicine.category}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs rounded-full px-3 border-slate-200 text-slate-500"
              >
                {medicine.subcategory}
              </Badge>
              {needsPrescription && (
                <Badge className="bg-amber-500 text-white rounded-full px-3 border-none shadow-sm gap-1">
                  <FileText className="w-3 h-3" /> Prescription
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-1">{medicine.brand}</p>
            <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
              {medicine.name}
            </h1>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              {medicine.description}
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-4xl font-bold text-slate-900">
              ${Number(medicine.price || 0).toFixed(2)}
            </span>
            <span className="text-sm text-slate-500">per unit</span>
          </div>
          <div className="flex items-center gap-2">
            {medicine.stock > 0 ? (
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-full px-4">
                {medicine.stock > 10
                  ? "In Stock"
                  : `Only ${medicine.stock} left`}
              </Badge>
            ) : (
              <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 rounded-full px-4">
                Out of Stock
              </Badge>
            )}
            <span className="text-xs text-slate-400">
              Supplier: {medicine.supplier}
            </span>
          </div>
          <Separator />

          {/* Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-slate-200 rounded-full overflow-hidden bg-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="h-11 w-11 rounded-none hover:bg-slate-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-bold text-slate-900">
                {qty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQty(Math.min(medicine.stock, qty + 1))}
                className="h-11 w-11 rounded-none hover:bg-slate-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={medicine.stock === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-11 font-semibold shadow-md active:scale-95 transition-all flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart - $
              {(Number(medicine.price || 0) * qty).toFixed(2)}
            </Button>
          </div>
          {needsPrescription && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Prescription Required
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You must upload a doctor's prescription to buy this medicine.
                  Upload from your dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="w-5 h-5 text-brand" strokeWidth={1.5} /> Dosage
              Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-sm text-slate-600 leading-relaxed"
              data-testid="dosage-info"
            >
              {medicine.dosage}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle
                className="w-5 h-5 text-amber-500"
                strokeWidth={1.5}
              />{" "}
              Side Effects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-0">
              {Array.isArray(medicine.side_effects) ? (
                medicine.side_effects.map((se, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-600 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />{" "}
                    {se}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">
                  No effects listed
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <ShieldCheck className="w-5 h-5 text-red-500" strokeWidth={1.5} />{" "}
              Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-0">
              {Array.isArray(medicine.interactions) &&
              medicine.interactions.length > 0 ? (
                medicine.interactions.map((int_, i) => (
                  <li
                    key={i}
                    className="text-sm text-red-700 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{int_}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">
                  No interactions listed
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Related Medicines */}
      {related.length > 0 && (
        <div className="mt-12" data-testid="related-medicines">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand" />
            <h2 className="font-heading text-xl font-semibold text-slate-900">
              Related Medicines
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((med) => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
