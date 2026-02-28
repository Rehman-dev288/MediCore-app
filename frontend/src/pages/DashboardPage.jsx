import { useState, useEffect, useMemo } from "react";
import {
  Package,
  FileText,
  Settings,
  Upload,
  Download,
  Sparkles,
  Check,
  X,
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
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import api from "../lib/api";
import { generateInvoice } from "../lib/invoice";
import MedicineCard from "../components/MedicineCard";

const statusColors = {
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  awaiting_prescription: "bg-orange-100 text-orange-700",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-slate-100 text-slate-700",
};

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const pwStrength = useMemo(() => {
    const pw = profile.password;
    if (!pw)
      return {
        score: 0,
        hasMinLength: false,
        hasLetter: false,
        hasNumber: false,
        hasSpecial: false,
      };

    const checks = {
      hasMinLength: pw.length >= 8,
      hasLetter: /[a-zA-Z]/.test(pw),
      hasNumber: /[0-9]/.test(pw),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { ...checks, score };
  }, [profile.password]);

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "text-red-500",
    "text-amber-500",
    "text-yellow-600",
    "text-emerald-600",
  ];
  const barColors = [
    "",
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data.orders))
      .catch(() => {});
    api
      .get("/prescriptions")
      .then((res) => setPrescriptions(res.data.prescriptions))
      .catch(() => {});
    api
      .get("/recommendations")
      .then((res) => setRecommendations(res.data.recommendations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User data from context:", user);
      setProfile({
        name: user.name || user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
      });
    }
  }, [user]);
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/prescriptions/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Prescription uploaded!");
      const refreshRes = await api.get("/prescriptions");
      setPrescriptions(refreshRes.data.prescriptions);
    } catch (err) {
      console.error("Frontend Upload Error:", err);
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (profile.name !== user.name) payload.name = profile.name;
      if (profile.email !== user.email) payload.email = profile.email;
      if (profile.phone !== user.phone) payload.phone = profile.phone;
      if (profile.password) payload.password = profile.password;
      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        setSaving(false);
        return;
      }
      await api.put("/auth/update", payload);
      updateUser(payload);
      setProfile((p) => ({ ...p, password: "" }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="dashboard-page"
    >
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-base text-slate-500 mt-1">
          Welcome back, {user?.name}
        </p>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-slate-100 rounded-lg p-1">
          <TabsTrigger
            value="orders"
            className="rounded-md"
            data-testid="tab-orders"
          >
            <Package className="w-4 h-4 mr-1.5" /> Orders
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="rounded-md"
            data-testid="tab-prescriptions"
          >
            <FileText className="w-4 h-4 mr-1.5" /> Prescriptions
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-md"
            data-testid="tab-settings"
          >
            <Settings className="w-4 h-4 mr-1.5" /> Account
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  No orders yet. Start shopping!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Items</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                      <TableHead className="font-semibold">Payment</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        data-testid={`order-row-${order.id}`}
                      >
                        <TableCell className="font-mono text-xs">
                          ORD-{order.id.toString().padStart(3, "0")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.items?.length} items
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${" "}
                          {order.total_amount
                            ? Number(order.total_amount).toFixed(2)
                            : "0.00"}
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          {order.payment_method?.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`capitalize text-xs ${statusColors[order.status] || "bg-slate-100 text-slate-700"}`}
                          >
                            {order.status?.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => generateInvoice(order)}
                            data-testid={`download-invoice-${order.id}`}
                          >
                            <Download className="w-3 h-3" /> PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer p-8 text-center">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Upload Prescription
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    Supported: JPG, PNG, PDF | Secure & Private
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleUpload}
                      className="hidden"
                      data-testid="dashboard-upload-prescription"
                    />
                    <Button
                      variant="outline"
                      className="rounded-full pointer-events-none"
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Choose File"}
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {prescriptions.length > 0 && (
              <Card className="border-slate-200">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">File</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((rx) => (
                        <TableRow
                          key={rx.id}
                          data-testid={`prescription-row-${rx.id}`}
                        >
                          <TableCell className="text-sm font-medium">
                            {rx.filename || rx.filename}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(rx.uploaded_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`capitalize text-xs ${statusColors[rx.status] || "bg-slate-100 text-slate-700"}`}
                            >
                              {rx.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        {/* Account Tab */}
        <TabsContent value="settings" className="flex justify-center py-4">
          <Card className="border-slate-200 w-full max-w-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={profile.email}
                    className="h-11 bg-slate-50"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="h-11"
                  />
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Label>New Password (leave blank to keep current)</Label>
                  <Input
                    type="password"
                    value={profile.password}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Enter new password"
                    className="h-11"
                  />

                  {profile.password && (
                    <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? barColors[pwStrength.score] : "bg-slate-200"}`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs font-bold ${strengthColors[pwStrength.score]}`}
                      >
                        {strengthLabels[pwStrength.score]}
                      </p>
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 mt-2">
                        {[
                          {
                            check: pwStrength.hasMinLength,
                            label: "Min 8 characters",
                          },
                          {
                            check: pwStrength.hasLetter,
                            label: "Contains letters",
                          },
                          {
                            check: pwStrength.hasNumber,
                            label: "Contains numbers",
                          },
                          {
                            check: pwStrength.hasSpecial,
                            label: "Special character",
                          },
                        ].map(({ check, label }) => (
                          <div
                            key={label}
                            className={`flex items-center gap-1.5 text-[11px] ${check ? "text-emerald-600" : "text-slate-400"}`}
                          >
                            {check ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-semibold mt-4 text-white"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand" />
            <h2 className="font-heading text-xl font-semibold text-slate-900">
              Recommended for You
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((med) => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
