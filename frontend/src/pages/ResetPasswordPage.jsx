import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Pill,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (pw) => {
    const checks = {
      hasMinLength: pw.length >= 8,
      hasLetter: /[a-zA-Z]/.test(pw),
      hasNumber: /[0-9]/.test(pw),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { ...checks, score, isStrong: score === 4 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!token.trim()) errs.token = "Reset token is required";
    if (!password) errs.password = "Password is required";
    else {
      const strength = validatePassword(password);
      if (!strength.isStrong)
        errs.password =
          "Password must contain letters, numbers, and special characters";
    }
    if (!confirm) errs.confirm = "Please confirm your password";
    else if (password !== confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setLoading(false);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Reset failed");
      setErrors({ token: " ", password: " ", confirm: " " });
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = validatePassword(password);
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

  if (success) {
    return (
      <div
        className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50"
        data-testid="reset-success"
      >
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="font-heading text-xl font-bold text-slate-900">
              Password Reset!
            </h2>
            <p className="text-sm text-slate-500">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <Link to="/login">
              <Button
                className="bg-blue-600 hover:bg-blue-700 rounded-lg px-8 h-10"
                data-testid="go-to-login-btn"
              >
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50"
      data-testid="reset-password-page"
    >
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <CardTitle className="font-heading text-2xl">
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your reset token and new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-token">
                Reset Token <span className="text-red-500">*</span>
              </Label>
              <Input
                data-testid="reset-token-input"
                id="reset-token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (errors.token) setErrors((p) => ({ ...p, token: "" }));
                }}
                placeholder="Paste your reset token"
                className={`h-11 font-mono text-sm ${errors.token ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.token && (
                <p className="text-xs text-red-500 mt-1">{errors.token}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">
                New Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  data-testid="reset-password-input"
                  id="new-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="Enter new password"
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
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
              {password && (
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
              <p className="text-[11px] text-slate-400">
                Min 8 characters with alphabets, numbers, and special characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-pw">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                data-testid="reset-confirm-input"
                id="confirm-new-pw"
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" }));
                }}
                placeholder="Confirm new password"
                className={`h-11 ${errors.confirm ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.confirm && (
                <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-medium"
              data-testid="reset-submit"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
