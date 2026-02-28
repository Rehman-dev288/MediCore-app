import { Link } from "react-router-dom";
import { ShoppingCart, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { toast } from "sonner";

export default function MedicineCard({ medicine }) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to add items to cart");
      return;
    }
    try {
      await addToCart(medicine.id);
      toast.success(`${medicine.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add to cart");
    }
  };

  return (
    <Link
      to={`/medicines/${medicine.id}`}
      data-testid={`medicine-card-${medicine.id}`}
    >
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden medicine-card-hover transition-all duration-300 group h-full flex flex-col">
        <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative">
          <img
            src={medicine.image_url}
            alt={medicine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {medicine.is_prescription_required === 1 && (
            <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-500 text-white text-[10px] font-semibold gap-1">
              <FileText className="w-3 h-3" /> Rx Required
            </Badge>
          )}
          {medicine.stock <= 10 && medicine.stock > 0 && (
            <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500 text-white text-[10px]">
              Low Stock
            </Badge>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-slate-500 font-medium mb-1">
            {medicine.brand}
          </p>
          <h3 className="font-heading font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">
            {medicine.name}
          </h3>
          <p className="text-xs text-slate-400 mb-3">{medicine.category}</p>
          <div className="mt-auto flex items-center justify-between">
            <span className="font-heading font-bold text-lg text-slate-900">
              ${Number(medicine.price || 0).toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={medicine.stock === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-8 px-3 text-xs font-medium shadow-sm active:scale-95 transition-all"
              data-testid={`add-to-cart-${medicine.id}`}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />{" "}
              {medicine.stock === 0 ? "Out of Stock" : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
