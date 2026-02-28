import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Truck,
  Pill,
  Activity,
  ArrowRight,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import MedicineCard from "../components/MedicineCard";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

const categories = [
  {
    name: "Prescription Drugs",
    icon: Stethoscope,
    color: "bg-teal-50 text-teal-700 border-teal-200",
    desc: "Verified medications",
  },
  {
    name: "OTC",
    icon: Pill,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Over-the-counter",
  },
  {
    name: "Wellness",
    icon: Activity,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Supplements & vitamins",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Medicines",
    desc: "All products sourced from licensed suppliers with quality assurance.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Get your medicines delivered to your doorstep within 24-48 hours.",
  },
  {
    icon: Stethoscope,
    title: "Prescription Support",
    desc: "Upload prescriptions securely. Our pharmacists verify every order.",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recType, setRecType] = useState("popular");
  const { user } = useAuth();
  useEffect(() => {
    api
      .get("/medicines?limit=8")
      .then((res) => setFeatured(res.data.medicines))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const endpoint = user ? "/recommendations" : "/recommendations/popular";
        const res = await api.get(endpoint);

        if (res.data && res.data.recommendations) {
          setRecommendations(res.data.recommendations);
          setRecType(res.data.type);
        }
      } catch (err) {
        console.error("Recommendations error:", err);
      }
    };

    fetchRecommendations();
  }, [user]);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Trusted
                Online Pharmacy
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                Your Health,
                <br />
                <span className="text-brand">Delivered</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-lg">
                Browse thousands of medicines, upload prescriptions, and get
                healthcare products delivered safely to your door.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (search.trim())
                    window.location.href = `/medicines?search=${encodeURIComponent(search)}`;
                }}
                className="flex gap-2 max-w-md"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    data-testid="hero-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search medicines..."
                    className="pl-10 h-12 rounded-full border-slate-200 shadow-sm bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 px-6 font-medium shadow-md"
                  data-testid="hero-search-btn"
                >
                  Search
                </Button>
              </form>
              <div className="flex items-center gap-6 pt-2">
                <div className="text-center">
                  <p className="font-heading text-2xl font-bold text-slate-900">
                    24+
                  </p>
                  <p className="text-xs text-slate-500">Medicines</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                  <p className="font-heading text-2xl font-bold text-slate-900">
                    24/7
                  </p>
                  <p className="text-xs text-slate-500">Support</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                  <p className="font-heading text-2xl font-bold text-slate-900">
                    Safe
                  </p>
                  <p className="text-xs text-slate-500">Delivery</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block animate-fade-in stagger-2">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/8657293/pexels-photo-8657293.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Pharmacist consulting"
                  className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        100% Verified
                      </p>
                      <p className="text-[10px] text-slate-500">
                        All medicines certified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-base text-slate-500 mt-2">
            Find what you need, from prescriptions to wellness products
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/medicines?category=${encodeURIComponent(cat.name)}`}
              data-testid={`category-${cat.name}`}
            >
              <div
                className={`border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${cat.color}`}
              >
                <cat.icon className="w-10 h-10 mb-4" strokeWidth={1.5} />
                <h3 className="font-heading font-semibold text-lg mb-1">
                  {cat.name}
                </h3>
                <p className="text-sm opacity-80">{cat.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium">
                  Browse <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Medicines */}
      {featured.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                  Popular Medicines
                </h2>
                <p className="text-base text-slate-500 mt-1">
                  Top-rated products from our pharmacy
                </p>
              </div>
              <Link to="/medicines">
                <Button
                  variant="outline"
                  className="rounded-full hidden sm:flex hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  data-testid="view-all-medicines"
                >
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((med) => (
                <MedicineCard key={med.id} medicine={med} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            Why Choose MediCore
          </h2>
          <p className="text-base text-slate-500 mt-2">
            Healthcare made simple, secure, and accessible
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="text-center p-8 rounded-xl border border-slate-200 bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                <f.icon
                  className="w-7 h-7 text-emerald-600"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          data-testid="recommendations-section"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-100">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {recType === "personalized"
                    ? "Recommended for You"
                    : "You Might Also Like"}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {recType === "personalized"
                    ? "Based on your browsing"
                    : "Popular picks from our catalog"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((med) => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-[#134E4A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to Order?
          </h2>

          <p className="font-body text-[16px] leading-[24px] font-normal text-white/90 mb-8 max-w-lg mx-auto tracking-normal">
            Create an account and start browsing our complete catalog of
            medicines and wellness products.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <button
                className="bg-white text-[#0F1729] hover:bg-slate-100 transition-colors rounded-full px-8 h-12 font-semibold shadow-lg text-[16px]"
                data-testid="cta-register"
              >
                Get Started
              </button>
            </Link>

            <Link to="/medicines">
              <button
                className="border border-white text-white hover:text-[#0F1729] hover:bg-white transition-all duration-300 rounded-full px-8 h-12 font-semibold text-[16px]"
                data-testid="cta-browse"
              >
                Browse Medicines
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
