import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Pill, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const getPasswordStrength = (pw) => {
  const checks = {
    hasMinLength: pw.length >= 8,
    hasLetter: /[a-zA-Z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { ...checks, score, isStrong: score === 4 };
};

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (user) return <Navigate to="/" replace />;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(form.email))
      errs.email = "Please enter a valid email address";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.password) errs.password = "Password is required";
    else {
      const s = getPasswordStrength(form.password);
      if (!s.isStrong) errs.password = "Weak password";
    }
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      toast.success(`Welcome to MediCore, ${res.user.name}!`);
      navigate("/");
    } catch (err) {
      const detail = err.response?.data?.detail || "Registration failed";
      if (detail === "Email already registered") {
        toast.error("Email already registered. Please login to continue.");
      } else {
        toast.error(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  const pwStrength = getPasswordStrength(form.password);
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

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50"
      data-testid="register-page"
    >
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <CardTitle className="font-heading text-2xl">
            Create Account
          </CardTitle>
          <CardDescription>
            Join MediCore for easy medicine ordering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-testid="register-name"
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="John Doe"
                className={`h-11 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.name && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-testid="register-name-error"
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                data-testid="register-email"
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                className={`h-11 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.email && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-testid="register-email-error"
                >
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                data-testid="register-phone"
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+1234567890"
                className={`h-11 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.phone && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-testid="register-phone-error"
                >
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Account Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.role}
                onValueChange={(v) => update("role", v)}
                data-testid="register-role"
              >
                <SelectTrigger
                  className="h-11"
                  data-testid="register-role-trigger"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl overflow-hidden">
                  <SelectItem
                    value="patient"
                    className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer py-3"
                  >
                    Patient
                  </SelectItem>
                  <SelectItem
                    value="doctor"
                    className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer py-3"
                  >
                    Doctor
                  </SelectItem>
                  <SelectItem
                    value="pharmacist"
                    className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer py-3"
                  >
                    Pharmacist
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  data-testid="register-password"
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Create a strong password"
                  className={`h-11 pr-10 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-testid="register-password-error"
                >
                  {errors.password}
                </p>
              )}
              {form.password && (
                <div className="space-y-2 mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? barColors[pwStrength.score] : "bg-slate-200"}`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${strengthColors[pwStrength.score]}`}
                  >
                    {strengthLabels[pwStrength.score]}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
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
                        className={`flex items-center gap-1 text-[11px] ${check ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {check ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}{" "}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!form.password && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Min 8 characters with alphabets, numbers, and special
                  characters
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                data-testid="register-confirm-password"
                id="confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Repeat password"
                className={`h-11 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.confirmPassword && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-testid="register-confirm-error"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-medium"
              data-testid="register-submit"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
              data-testid="register-to-login"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
