import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <div className="mt-2 mx-auto w-20 h-1 bg-emerald-500 rounded-full"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full">
              <FileText size={18} />
            </div>
            <p className="text-lg text-slate-700">
              By accessing or using Holidaze you agree to the following Terms of
              Service. These Terms are a short summary; the full legal text will
              follow.
            </p>
          </div>

          <div className="space-y-8 mt-8">
            <div className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mr-3">
                  1
                </span>
                Accounts
              </h2>
              <p className="mt-2 text-slate-600 pl-10">
                Provide accurate information and keep your credentials secure.
                You're responsible for all activity under your account.
              </p>
            </div>

            <div className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mr-3">
                  2
                </span>
                Bookings
              </h2>
              <p className="mt-2 text-slate-600 pl-10">
                When you book, you enter a direct contract with the venue
                manager. Cancellation policies are shown before you confirm.
              </p>
            </div>

            <div className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mr-3">
                  3
                </span>
                Acceptable Use
              </h2>
              <p className="mt-2 text-slate-600 pl-10">
                No fraudulent listings, unlawful activity or attempts to hack.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block fixed bottom-0 right-0 w-64 h-64 bg-emerald-100 rounded-full opacity-20 -z-10 translate-x-1/4 translate-y-1/4"></div>
    </div>
  );
}
