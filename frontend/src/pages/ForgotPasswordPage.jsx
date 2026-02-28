import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Pill, ArrowLeft, Mail, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [demoToken, setDemoToken] = useState("");
  const [errors, setErrors] = useState({});
  const [isNotRegistered, setIsNotRegistered] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!validateEmail(email))
      errs.email = "Please enter a valid email address";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (isNotRegistered) {
      window.location.href = "/register";
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });

      toast.success("Email Verified! Proceeding to reset...", {
        style: {
          background: "#ecfdf5",
          color: "#059669",
          border: "1px solid #10b981",
        },
      });

      setSent(true);
      setIsNotRegistered(false);
      if (res.data.demo_token) setDemoToken(res.data.demo_token);
    } catch (err) {
      if (err.response?.status === 404) {
        setIsNotRegistered(true);
        setErrors({
          email: "This email is not registered. Please register first.",
        });
        toast.error("Email not found in our database");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(demoToken)
        .then(() => toast.success("Token copied to clipboard"))
        .catch(() => {
          // Fallback: select text manually
          const el = document.querySelector('[data-testid="demo-reset-token"]');
          if (el) {
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            toast.success("Token selected - press Ctrl+C to copy");
          }
        });
    } else {
      toast.info("Please manually select and copy the token");
    }
  };

  if (sent) {
    return (
      <div
        className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50"
        data-testid="forgot-password-sent"
      >
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="font-heading text-xl font-bold text-slate-900">
              Check Your Email
            </h2>
            <p className="text-sm text-slate-500">
              If an account exists with <strong>{email}</strong>, we've sent
              password reset instructions.
            </p>

            {demoToken && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <p className="text-xs font-semibold text-amber-700 mb-2">
                  Demo Mode: Reset Token
                </p>
                <div className="flex items-center gap-2">
                  <code
                    className="text-xs bg-white border border-amber-200 rounded px-2 py-1 flex-1 truncate font-mono"
                    data-testid="demo-reset-token"
                  >
                    {demoToken}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToken}
                    className="h-7 text-xs shrink-0"
                    data-testid="copy-token-btn"
                  >
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <p className="text-[10px] text-amber-600 mt-2">
                  In production, this token would be sent via email. Use it on
                  the reset page.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Link
                to={`/reset-password${demoToken ? `?token=${demoToken}` : ""}`}
              >
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg h-10"
                  data-testid="go-to-reset-btn"
                >
                  Reset Password
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full rounded-lg h-10">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50"
      data-testid="forgot-password-page"
    >
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <CardTitle className="font-heading text-2xl">
            Forgot Password
          </CardTitle>
          <CardDescription>
            Enter your email to verify your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                  if (isNotRegistered) setIsNotRegistered(false);
                }}
                placeholder="you@example.com"
                className={`h-11 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-xs font-semibold text-red-600 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-medium transition-colors"
            >
              {loading
                ? "Checking..."
                : isNotRegistered
                  ? "Register Now"
                  : "Verify Email"}
            </Button>
          </form>
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              data-testid="back-to-login"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
