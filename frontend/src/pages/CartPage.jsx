import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useCart } from "../contexts/CartContext";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();

  const handleUpdateQty = async (medicineId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateQuantity(medicineId, newQty);
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (medicineId, name) => {
    try {
      await removeItem(medicineId);
      toast.success(`${name} removed from cart`);
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
        data-testid="cart-empty"
      >
        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-semibold text-slate-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Browse our catalog and add medicines to your cart
        </p>
        <Link to="/medicines">
          <Button
            className="bg-blue-600 hover:bg-blue-700 rounded-full px-8"
            data-testid="browse-medicines-btn"
          >
            Browse Medicines
          </Button>
        </Link>
      </div>
    );
  }

  const hasRx = cart.items.some(
    (item) => Number(item.is_prescription_required) === 1,
  );

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="cart-page"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          data-testid="clear-cart-btn"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.medicine_id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4"
              data-testid={`cart-item-${item.medicine_id}`}
            >
              <div className="w-20 h-20 rounded-lg bg-slate-50 overflow-hidden flex-shrink-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/medicines/${item.medicine_id}`}
                      className="font-heading font-semibold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.brand}
                    </p>

                    {Number(item.is_prescription_required) === 1 && (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        Prescription required
                      </p>
                    )}
                  </div>
                  <p className="font-heading font-bold text-slate-900 text-sm whitespace-nowrap">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                      onClick={() =>
                        handleUpdateQty(item.medicine_id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                      onClick={() =>
                        handleUpdateQty(item.medicine_id, item.quantity + 1)
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.medicine_id, item.name)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                    data-testid={`remove-item-${item.medicine_id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="border-slate-200 sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">
                  ${Number(cart.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-heading font-bold text-lg">
                <span>Total</span>
                <span>${cart.total?.toFixed(2)}</span>
              </div>

              {hasRx && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 font-medium">
                    Your cart contains prescription items. You'll need to upload
                    or select a verified prescription at checkout.
                  </p>
                </div>
              )}

              <Link to="/checkout" className="block">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-medium mt-2"
                  data-testid="checkout-btn"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/medicines" className="block">
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                >
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
