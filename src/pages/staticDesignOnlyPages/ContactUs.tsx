import { Link } from "react-router-dom";
// You'll need to install lucide-react: npm install lucide-react
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-100 py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header section with decorative element */}
        <div className="relative mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">
            Contact Us
          </h1>
          <div className="mt-2 mx-auto w-20 h-1 bg-emerald-500 rounded-full"></div>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <p className="text-lg text-slate-700 mb-6">
            We'd love to hear from you.
          </p>

          {/* Contact information with improved styling */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Email</p>
                <a
                  href="mailto:support@holidaze.com"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  support@holidaze.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Phone</p>
                <p className="text-slate-700">
                  +47 55 60 65 70{" "}
                  <span className="text-sm text-slate-500">
                    (Mon–Fri 09-16 CET)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Address</p>
                <p className="text-slate-700">
                  Fjordgata 42, 5000 Bergen, Norway
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back button with improved styling */}
        <div className="text-center sm:text-left">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Decorative element - positioned with negative z-index */}
      <div className="hidden sm:block fixed bottom-0 right-0 w-64 h-64 bg-emerald-100 rounded-full opacity-20 -z-10 translate-x-1/4 translate-y-1/4"></div>
    </div>
  );
}
