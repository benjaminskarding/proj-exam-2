import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Database, UserCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>
        <div className="relative mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">
            Privacy Policy
          </h1>
          <div className="mt-2 mx-auto w-20 h-1 bg-emerald-500 rounded-full"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full">
              <Shield size={18} />
            </div>
            <p className="text-lg text-slate-700">
              We respect your privacy and comply with the GDPR. This brief
              covers what we collect and why.
            </p>
          </div>

          <div className="space-y-8 mt-8">
            <div className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full mr-3">
                  <Database size={16} />
                </div>
                Data We Collect
              </h2>
              <ul className="mt-3 space-y-2 pl-11">
                {[
                  "Account info (name, e-mail, avatar)",
                  "Booking details (dates, guests, venue)",
                  "Usage analytics (pages visited, device type)",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 mr-2"></span>
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full mr-3">
                  <UserCheck size={16} />
                </div>
                Your Rights
              </h2>
              <p className="mt-3 text-slate-600 pl-11">
                Request access, correction or deletion anytime via{" "}
                <a
                  href="mailto:privacy@holidaze.example"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  privacy@holidaze.example
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block fixed bottom-0 right-0 w-64 h-64 bg-emerald-100 rounded-full opacity-20 -z-10 translate-x-1/4 translate-y-1/4"></div>
    </div>
  );
}
