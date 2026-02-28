import { useState, useEffect } from "react";
import {
  Package,
  Users,
  Pill,
  FileText,
  AlertTriangle,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Clock,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import api from "../lib/api";

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
};

function StatCard({ icon: Icon, title, value, color = "text-brand" }) {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 ${color}`}
        >
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{title}</p>
          <p className="font-heading text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const emptyMedicine = {
  name: "",
  brand: "",
  category: "Prescription Drugs",
  subcategory: "",
  price: "",
  description: "",
  dosage: "",
  side_effects: "",
  interactions: "",
  is_prescription_required: false,
  stock: "",
  expiry_date: "",
  image_url: "",
  supplier: "",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [reports, setReports] = useState(null);
  const [medDialog, setMedDialog] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [medForm, setMedForm] = useState(emptyMedicine);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [
        statsRes,
        medsRes,
        ordersRes,
        usersRes,
        rxRes,
        alertsRes,
        reportsRes,
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/medicines?limit=100"),
        api.get("/orders/all/admin"),
        api.get("/admin/users"),
        api.get("/prescriptions/all"),
        api.get("/admin/alerts"),
        api.get("/admin/reports"),
      ]);
      setStats(statsRes.data);
      setMedicines(medsRes.data.medicines);
      setOrders(ordersRes.data.orders);
      setUsers(usersRes.data.users);
      setPrescriptions(rxRes.data.prescriptions);
      setAlerts(alertsRes.data);
      setReports(reportsRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddMedicine = () => {
    setEditMed(null);
    setMedForm(emptyMedicine);
    setMedDialog(true);
  };
  const openEditMedicine = (med) => {
    setEditMed(med);

    const formattedSideEffects = Array.isArray(med.side_effects)
      ? med.side_effects.join(", ")
      : med.side_effects || "";

    const formattedInteractions = Array.isArray(med.interactions)
      ? med.interactions.join(", ")
      : med.interactions || "";

    setMedForm({
      ...med,
      side_effects: formattedSideEffects,
      interactions: formattedInteractions,
      price: String(med.price || ""),
      stock: String(med.stock || ""),
      is_prescription_required: med.is_prescription_required ?? false,
    });

    setMedDialog(true);
  };

  const handleSaveMedicine = async () => {
    setSaving(true);
    try {
      const cleanPrice = parseFloat(medForm.price);
      const cleanStock = parseInt(medForm.stock);

      const payload = {
        ...medForm,
        price: isNaN(cleanPrice) ? 0.0 : cleanPrice,
        stock: isNaN(cleanStock) ? 0 : cleanStock,
        is_prescription_required: Boolean(medForm.is_prescription_required),
        side_effects:
          typeof medForm.side_effects === "string"
            ? medForm.side_effects
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : medForm.side_effects || [],
        interactions:
          typeof medForm.interactions === "string"
            ? medForm.interactions
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : medForm.interactions || [],
      };

      if (editMed) {
        const res = await api.put(`/medicines/${editMed.id}`, payload);
        toast.success("Medicine updated successfully");
        setMedicines((prev) =>
          prev.map((m) => (m.id === editMed.id ? res.data : m)),
        );
      } else {
        const res = await api.post("/medicines", payload);
        toast.success("New medicine added");
        setMedicines((prev) => [res.data, ...prev]);
      }

      setMedDialog(false);
      fetchData();
    } catch (err) {
      console.error("MySQL/Save Error:", err);
      toast.error(err.response?.data?.detail || "Database save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleFinalDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/medicines/${deleteId}`);
      setMedicines((prev) => prev.filter((m) => m.id !== deleteId));
      toast.success("Medicine deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete medicine");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleVerifyRx = async (id, newStatus) => {
    try {
      await api.put(`/prescriptions/${id}/status`, { status: newStatus });
      toast.success(`Prescription ${newStatus} successfully!`);
      fetchData();
    } catch (err) {
      console.error("RX Update Error:", err);
      toast.error(err.response?.data?.detail || "Failed to update status");
    }
  };

  const handleUserRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );

      toast.success(`User updated to ${newRole}`);
    } catch (err) {
      console.error("Role Update Error:", err);
      toast.error(err.response?.data?.detail || "Failed to update role");
    }
  };

  const updateForm = (field, value) =>
    setMedForm((p) => ({ ...p, [field]: value }));

  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      console.error("Order Update Error:", err);
      toast.error(err.response?.data?.detail || "Failed to update status");
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="admin-dashboard"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
            Admin Panel
          </h1>
          <p className="text-base text-slate-500 mt-1">
            Manage your pharmacy operations
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 px-2 py-0.5 text-[10px] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Admin
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 rounded-lg p-1 flex-wrap h-auto">
          <TabsTrigger
            value="overview"
            className="rounded-md text-xs"
            data-testid="admin-tab-overview"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-md text-xs"
            data-testid="admin-tab-inventory"
          >
            <Pill className="w-3.5 h-3.5 mr-1" /> Inventory
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="rounded-md text-xs"
            data-testid="admin-tab-orders"
          >
            <Package className="w-3.5 h-3.5 mr-1" /> Orders
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-md text-xs"
            data-testid="admin-tab-users"
          >
            <Users className="w-3.5 h-3.5 mr-1" /> Users
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="rounded-md text-xs"
            data-testid="admin-tab-prescriptions"
          >
            <FileText className="w-3.5 h-3.5 mr-1" /> Prescriptions
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="rounded-md text-xs"
            data-testid="admin-tab-alerts"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1" /> Reports & Alerts
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Pill}
                title="Total Medicines"
                value={stats.total_medicines}
              />
              <StatCard
                icon={Package}
                title="Total Orders"
                value={stats.total_orders}
                color="text-blue-600"
              />
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.total_users}
                color="text-indigo-600"
              />
              <StatCard
                icon={DollarSign}
                title="Revenue"
                value={`$${stats.total_revenue?.toFixed(2)}`}
                color="text-emerald-600"
              />
              <StatCard
                icon={AlertTriangle}
                title="Low Stock"
                value={stats.low_stock}
                color="text-amber-600"
              />
              <StatCard
                icon={FileText}
                title="Pending Rx"
                value={stats.pending_prescriptions}
                color="text-orange-600"
              />
              <StatCard
                icon={Clock}
                title="Expiring Soon"
                value={stats.expiring_medicines}
                color="text-red-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Active"
                value="24/7"
                color="text-emerald-600"
              />
            </div>
          )}

          <Card className="border-slate-200 mt-6">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recent_orders?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recent_orders.map((order) => (
                      <TableRow
                        key={order.id}
                        data-testid={`order-row-${order.id}`}
                      >
                        <TableCell className="font-mono text-xs">
                          ORD-{order.id.toString().padStart(3, "0")}
                        </TableCell>

                        <TableCell className="text-sm">
                          {order.user_name || "Guest User"}
                        </TableCell>

                        <TableCell className="font-semibold">
                          $
                          {Number(
                            order.total || order.total_amount || 0,
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`text-xs capitalize ${statusColors[order.status] || ""}`}
                          >
                            {order.status?.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <ShoppingBag className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    No orders yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Customer orders will appear here once they are placed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">
              {medicines.length} medicines
            </p>
            <Button
              onClick={openAddMedicine}
              className="bg-blue-600 hover:bg-blue-700 rounded-full h-9 text-sm"
              data-testid="add-medicine-btn"
            >
              <Pill className="w-4 h-4 mr-1" /> Add Medicine
            </Button>
          </div>
          <Card className="border-slate-200">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Rx</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.map((m) => (
                    <TableRow key={m.id} data-testid={`med-row-${m.id}`}>
                      <TableCell className="text-sm font-medium">
                        {m.name}
                      </TableCell>
                      <TableCell className="text-sm">{m.brand}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {m.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${Number(m.price || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            m.stock <= 10 ? "text-red-600 font-semibold" : ""
                          }
                        >
                          {m.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {m.expiry_date
                          ? new Date(m.expiry_date).toLocaleDateString("en-GB")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {m.is_prescription_required === true ||
                        m.is_prescription_required === 1 ||
                        String(m.is_prescription_required).toLowerCase() ===
                          "true" ? (
                          <Badge className="bg-amber-100 text-amber-700 text-[10px] border-amber-200">
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-slate-200 hover:bg-slate-100"
                            onClick={() => openEditMedicine(m)}
                            data-testid={`edit-med-${m.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => confirmDelete(m.id)}
                            data-testid={`delete-med-${m.id}`}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders */}
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
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
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
                          $
                          {Number(
                            order.total || order.total_amount || 0,
                          ).toFixed(2)}
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
                          <Select
                            value={order.status}
                            onValueChange={(v) =>
                              handleOrderStatus(order.id, v)
                            }
                          >
                            <SelectTrigger className="h-8 w-32 text-xs bg-white border-slate-200 hover:bg-slate-50 transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 shadow-lg">
                              {[
                                "pending",
                                "confirmed",
                                "processing",
                                "shipped",
                                "delivered",
                                "cancelled",
                              ].map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="text-xs capitalize focus:bg-slate-100 cursor-pointer"
                                >
                                  {s.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {orders.length === 0 && (
                  <p className="text-center py-8 text-sm text-slate-400">
                    No orders yet
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <Card className="border-slate-200">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                      <TableCell className="text-sm font-medium">
                        {u.name}
                      </TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell className="text-sm">{u.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(v) => handleUserRole(u.id, v)}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs font-medium bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors focus:ring-1 focus:ring-slate-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 shadow-md">
                            {["admin", "patient", "doctor", "pharmacist"].map(
                              (r) => (
                                <SelectItem
                                  key={r}
                                  value={r}
                                  className="text-xs capitalize focus:bg-slate-100 focus:text-slate-900 cursor-pointer"
                                >
                                  {r}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions */}
        <TabsContent value="prescriptions">
          <Card className="border-slate-200">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>User</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((rx) => (
                    <TableRow key={rx.id} data-testid={`admin-rx-${rx.id}`}>
                      <TableCell className="text-sm font-medium">
                        {rx.user_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {rx.original_filename || rx.filename}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(rx.uploaded_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs capitalize ${statusColors[rx.status] || ""}`}
                        >
                          {rx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rx.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                onClick={() =>
                                  handleVerifyRx(rx.id, "verified")
                                }
                                data-testid={`verify-rx-${rx.id}`}
                              >
                                Verify
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-red-600 border-red-200"
                                onClick={() =>
                                  handleVerifyRx(rx.id, "rejected")
                                }
                                data-testid={`reject-rx-${rx.id}`}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {prescriptions.length === 0 && (
                <p className="text-center py-8 text-sm text-slate-400">
                  No prescriptions
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts & Reports */}
        <TabsContent value="alerts">
          <div className="space-y-6">
            {/* Charts Row */}
            {reports && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" /> Top
                      Selling Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reports.sales_by_product?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={reports.sales_by_product
                            .sort((a, b) => b.total_sold - a.total_sold)
                            .slice(0, 8)
                            .map((s) => ({
                              name: s.name || s._id,
                              sold: s.unitsSold || s.total_sold,
                              revenue: s.revenue,
                            }))}
                          margin={{ bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: 10,
                              fill: "#1e293b",
                              fontWeight: 500,
                            }}
                            angle={-25}
                            textAnchor="end"
                            interval={0}
                            axisLine={{ stroke: "#e2e8f0" }}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: "#f8fafc" }}
                            contentStyle={{
                              backgroundColor: "#fff",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                              padding: "12px",
                            }}
                            itemStyle={{ fontSize: "12px", padding: "2px 0" }}
                            labelStyle={{
                              color: "#000",
                              fontWeight: "bold",
                              marginBottom: "5px",
                              fontSize: "14px",
                            }}
                            formatter={(value, name) => {
                              if (name === "revenue")
                                return [
                                  <span
                                    style={{
                                      color: "#2563EB",
                                      fontWeight: "600",
                                    }}
                                  >
                                    ${value}
                                  </span>,
                                  "Revenue",
                                ];
                              return [
                                <span
                                  style={{
                                    color: "#10B981",
                                    fontWeight: "600",
                                  }}
                                >
                                  {value} Units
                                </span>,
                                "Units Sold",
                              ];
                            }}
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                          />
                          <Bar
                            dataKey="revenue"
                            name="revenue"
                            fill="#2563EB"
                            radius={[4, 4, 0, 0]}
                            barSize={35}
                          />
                          <Bar
                            dataKey="sold"
                            name="units"
                            fill="#10B981"
                            radius={[4, 4, 0, 0]}
                            barSize={35}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-8">
                        No sales data available.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" /> Orders by
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reports.orders_by_status?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reports.orders_by_status.map((s) => ({
                              name: (s._id || "unknown").toLowerCase(),
                              value: s.count,
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={105}
                            innerRadius={45}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={{ stroke: "#cbd5e1" }}
                          >
                            {reports.orders_by_status.map((entry, i) => {
                              const status = (entry._id || "").toLowerCase();
                              let color = "#94a3b8";
                              if (status === "delivered") color = "#10B981";
                              else if (
                                status === "pending" ||
                                status === "waiting"
                              )
                                color = "#2563EB";
                              else if (status === "shipped") color = "#6366F1";
                              else if (status === "processing")
                                color = "#F59E0B";
                              else if (status === "cancelled")
                                color = "#EF4444";
                              return (
                                <Cell
                                  key={i}
                                  fill={color}
                                  stroke="#fff"
                                  strokeWidth={2}
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-8">
                        No order data available.
                      </p>
                    )}
                  </CardContent>
                </Card>
                {/* Inventory Levels */}
                <Card className="border-slate-200 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pill className="w-5 h-5 text-indigo-600" /> Inventory
                      Stock Levels
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reports.inventory?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={reports.inventory
                            .sort((a, b) => a.stock - b.stock)
                            .slice(0, 15)
                            .map((m) => ({
                              name:
                                m.name.length > 18
                                  ? m.name.slice(0, 18) + "..."
                                  : m.name,
                              stock: m.stock,
                              category: m.category,
                            }))}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 9 }}
                            angle={-35}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              fontSize: 12,
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                            }}
                            formatter={(value, name, props) => [
                              `${value} units`,
                              `Stock (${props.payload.category})`,
                            ]}
                          />
                          <Bar
                            dataKey="stock"
                            fill="#6366F1"
                            radius={[4, 4, 0, 0]}
                          >
                            {reports.inventory
                              .sort((a, b) => a.stock - b.stock)
                              .slice(0, 15)
                              .map((m, i) => (
                                <Cell
                                  key={i}
                                  fill={
                                    m.stock <= 10
                                      ? "#DC2626"
                                      : m.stock <= 50
                                        ? "#D97706"
                                        : "#059669"
                                  }
                                />
                              ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-8">
                        No inventory data
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" /> Low
                    Stock Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alerts?.low_stock?.length > 0 ? (
                    <div className="space-y-2">
                      {alerts.low_stock.map((m) => (
                        <div
                          key={m.id}
                          className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {m.name}
                            </p>
                            <p className="text-xs text-slate-500">{m.brand}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-700">
                            {m.stock} left
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No low stock items</p>
                  )}
                </CardContent>
              </Card>
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" /> Expiring Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alerts?.expiring?.length > 0 ? (
                    <div className="space-y-2">
                      {alerts.expiring.map((m) => (
                        <div
                          key={m.id}
                          className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {m.name}
                            </p>
                            <p className="text-xs text-slate-500">{m.brand}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-700">
                            {m.expiry_date}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No expiring items</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Medicine Dialog */}
      <Dialog open={medDialog} onOpenChange={setMedDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMed ? "Edit Medicine" : "Add Medicine"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={medForm.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="h-9 text-sm"
                  data-testid="med-form-name"
                />
              </div>
              <div>
                <Label className="text-xs">Brand</Label>
                <Input
                  value={medForm.brand}
                  onChange={(e) => updateForm("brand", e.target.value)}
                  className="h-9 text-sm"
                  data-testid="med-form-brand"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Category</Label>
                <Select
                  value={medForm.category}
                  onValueChange={(v) => updateForm("category", v)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prescription Drugs">
                      Prescription Drugs
                    </SelectItem>
                    <SelectItem value="OTC">OTC</SelectItem>
                    <SelectItem value="Wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Subcategory</Label>
                <Input
                  value={medForm.subcategory}
                  onChange={(e) => updateForm("subcategory", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={medForm.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  className="h-9 text-sm"
                  data-testid="med-form-price"
                />
              </div>
              <div>
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  value={medForm.stock}
                  onChange={(e) => updateForm("stock", e.target.value)}
                  className="h-9 text-sm"
                  data-testid="med-form-stock"
                />
              </div>
              <div>
                <Label className="text-xs">Expiry Date</Label>
                <Input
                  type="date"
                  value={medForm.expiry_date}
                  onChange={(e) => updateForm("expiry_date", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input
                value={medForm.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Dosage</Label>
              <Input
                value={medForm.dosage}
                onChange={(e) => updateForm("dosage", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Side Effects (comma separated)</Label>
              <Input
                value={medForm.side_effects}
                onChange={(e) => updateForm("side_effects", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Interactions (comma separated)</Label>
              <Input
                value={medForm.interactions}
                onChange={(e) => updateForm("interactions", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Image URL</Label>
              <Input
                value={medForm.image_url}
                onChange={(e) => updateForm("image_url", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Supplier</Label>
              <Input
                value={medForm.supplier}
                onChange={(e) => updateForm("supplier", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={medForm.requires_prescription}
                onChange={(e) =>
                  updateForm("requires_prescription", e.target.checked)
                }
                id="rx-req"
                className="rounded"
              />
              <Label htmlFor="rx-req" className="text-xs">
                Requires Prescription
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveMedicine}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="save-medicine-btn"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 text-center">
                Delete Medicine?
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Are you sure you want to delete this medicine? This action cannot
              be undone and will remove all associated data.
            </p>

            <div className="flex w-full gap-3 mt-8">
              <Button
                variant="ghost"
                className="flex-1 hover:bg-slate-100 text-slate-600 font-medium"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#ef4444] hover:bg-red-600 text-white font-medium rounded-lg"
                onClick={handleFinalDelete}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
