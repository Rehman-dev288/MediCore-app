import { Link } from 'react-router-dom';
import { Pill, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from './ui/separator';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-heading text-lg font-bold text-white">MediCore</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">Your trusted online pharmacy for medicines, wellness products, and healthcare needs. Quality care, delivered.</p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
         <ul className="space-y-2.5">
        {[
          { name: "Browse Medicines", link: "/medicines" },
          { name: "OTC Products", link: "/medicines?category=OTC" },
          { name: "Wellness", link: "/medicines?category=Wellness" },
          { name: "My Orders", link: "/dashboard" },
        ].map((item) => (
         <li key={item.name}>
          <Link 
           to={item.link} 
           className="group relative text-sm text-slate-400 hover:text-white transition-colors inline-block"
          >
        {item.name}
        <span className="absolute left-0 bottom-[-2px] w-0 h-[1.5px] bg-white transition-all duration-300 group-hover:w-full"></span>
        </Link>
        </li>
        ))}
          </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-slate-400">Help Center</span></li>
              <li><span className="text-sm text-slate-400">Prescription Guide</span></li>
              <li><span className="text-sm text-slate-400">Returns Policy</span></li>
              <li><span className="text-sm text-slate-400">Privacy Policy</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400"><Mail className="w-4 h-4 text-slate-500" strokeWidth={1.5} /> support@medicore.com</li>
              <li className="flex items-center gap-2 text-sm text-slate-400"><Phone className="w-4 h-4 text-slate-500" strokeWidth={1.5} /> +1 (800) 123-4567</li>
              <li className="flex items-start gap-2 text-sm text-slate-400"><MapPin className="w-4 h-4 text-slate-500 mt-0.5" strokeWidth={1.5} /> 123 Health St, Medical District</li>
            </ul>
          </div>
        </div>
        <Separator className="my-8 bg-slate-800" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">&copy; 2026 MediCore. All rights reserved.</p>
          <p className="text-xs text-slate-500">Licensed Online Pharmacy | Secure & Private</p>
        </div>
      </div>
    </footer>
  );
}
