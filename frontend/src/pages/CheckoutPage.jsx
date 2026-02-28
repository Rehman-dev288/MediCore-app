import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Banknote,
  Building2,
  CheckCircle2,
  FileText,
  Upload,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import api from "../lib/api";

const paymentMethods = [
  {
    id: "credit_card",
    name: "Credit / Debit Card",
    icon: CreditCard,
    desc: "Visa, Mastercard, Amex",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: Building2,
    desc: "Direct bank payment",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: Banknote,
    desc: "Pay when you receive",
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart, loading } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [payMethod, setPayMethod] = useState("credit_card");
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedRx, setSelectedRx] = useState("");
  const [uploading, setUploading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [addressError, setAddressError] = useState(false);

  const hasRx = cart.items?.some(
    (item) => Number(item.is_prescription_required) === 1,
  );
  useEffect(() => {
    if (!loading && (!cart.items || cart.items.length === 0) && !orderSuccess) {
      navigate("/cart");
    }
  }, [cart.items, loading, navigate, orderSuccess]);

  useEffect(() => {
    if (hasRx && user) {
      api
        .get("/prescriptions")
        .then((res) => setPrescriptions(res.data.prescriptions))
        .catch(() => {});
    }
  }, [hasRx, user]);

  const handleUploadRx = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (Max 5MB)");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/prescriptions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Uploaded! Now select it from the list.");

      const rxRes = await api.get("/prescriptions");
      const latestRx = rxRes.data.prescriptions[0];
      setPrescriptions(rxRes.data.prescriptions);
      if (latestRx) setSelectedRx(latestRx.id);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setAddressError(true);
      toast.error("Please enter a shipping address");
      document.getElementById("address");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setAddressError(false);
    if (hasRx && !selectedRx) {
      toast.error("Please select or upload a prescription");
      const rxSection = document.getElementById("prescription-section");
      if (rxSection) {
        rxSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setPlacing(true);
    try {
      const payload = { payment_method: payMethod, shipping_address: address };
      if (selectedRx) payload.prescription_id = selectedRx;
      const res = await api.post("/orders", payload);
      setOrderSuccess(res.data);
      await fetchCart();
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };
  if (loading && !orderSuccess) {
    return <div className="py-20 text-center">Loading checkout...</div>;
  }
  if (orderSuccess) {
    return (
      <div
        className="max-w-lg mx-auto px-4 py-20 text-center"
        data-testid="order-success"
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
          Order Placed!
        </h2>
        <p className="text-sm text-slate-500 mb-1">
          Order ID:{" "}
          <span className="font-mono text-xs">{orderSuccess.order_id}</span>
        </p>
        <p className="text-sm text-slate-500 mb-1">
          Status:{" "}
          <span className="font-semibold text-brand capitalize">
            {orderSuccess.status.replace("_", " ")}
          </span>
        </p>
        <p className="text-lg font-heading font-bold text-slate-900 mt-3 mb-6">
          Total: ${orderSuccess.total?.toFixed(2)}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
            data-testid="view-orders-btn"
          >
            View Orders
          </Button>
          <Button
            onClick={() => navigate("/medicines")}
            variant="outline"
            className="rounded-full px-6"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="checkout-page"
    >
      <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="address" className="text-sm">
                Full Address
              </Label>
              <Input
                data-testid="checkout-address"
                id="address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (e.target.value.trim()) setAddressError(false);
                }}
                placeholder="Enter your complete shipping address"
                className={`mt-2 h-11 transition-all ${
                  addressError
                    ? "border-red-500 focus-visible:ring-red-500 bg-red-50"
                    : "border-slate-200"
                }`}
              />{" "}
              {addressError && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  Shipping address is required to deliver your order.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={payMethod}
                onValueChange={setPayMethod}
                className="space-y-3"
              >
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${payMethod === pm.id ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-300"}`}
                    data-testid={`payment-${pm.id}`}
                  >
                    <RadioGroupItem value={pm.id} />
                    <pm.icon
                      className="w-5 h-5 text-slate-500"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {pm.name}
                      </p>
                      <p className="text-xs text-slate-500">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
              <p className="text-xs text-slate-400 mt-3 italic">
                This is a simulated payment flow for demonstration purposes.
              </p>
            </CardContent>
          </Card>

          {/* Prescription */}
          {hasRx && (
            <Card
              id="prescription-section"
              className="border-amber-200 bg-amber-50/30"
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" /> Prescription
                  Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Some items require a valid prescription. Select an existing
                  one or upload a new prescription.
                </p>
                {prescriptions.length > 0 && (
                  <RadioGroup
                    value={selectedRx}
                    onValueChange={setSelectedRx}
                    className="space-y-2"
                  >
                    {prescriptions.map((rx) => (
                      <label
                        key={rx.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedRx === rx.id ? "border-blue-500 bg-blue-50/50" : "border-slate-200"}`}
                        data-testid={`prescription-${rx.id}`}
                      >
                        <RadioGroupItem value={rx.id} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {rx.original_filename || rx.filename}
                          </p>
                          <p className="text-xs text-slate-500">
                            Status:{" "}
                            <span
                              className={
                                rx.status === "verified"
                                  ? "text-emerald-600"
                                  : rx.status === "pending"
                                    ? "text-amber-600"
                                    : "text-red-600"
                              }
                            >
                              {rx.status}
                            </span>
                          </p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                )}
                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors cursor-pointer p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Upload New Prescription
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    JPG, PNG, or PDF (Secure & Private)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleUploadRx}
                      className="hidden"
                      data-testid="upload-prescription-input"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full pointer-events-none"
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Choose File"}
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="border-slate-200 sticky top-24">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.items?.map((item) => (
                <div
                  key={item.medicine_id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-slate-600 truncate mr-2">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">${cart.total?.toFixed(2)}</span>
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
              <Button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-medium mt-3"
                data-testid="place-order-btn"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
