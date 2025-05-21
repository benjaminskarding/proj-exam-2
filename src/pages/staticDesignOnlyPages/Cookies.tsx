import { Link } from "react-router-dom";
import { ArrowLeft, Cookie, Settings } from "lucide-react";

export default function Cookies() {
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
            Cookie Policy
          </h1>
          <div className="mt-2 mx-auto w-20 h-1 bg-emerald-500 rounded-full"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full">
              <Cookie size={18} />
            </div>
            <p className="text-lg text-slate-700">
              Holidaze uses cookies to keep you logged in, remember preferences
              and run anonymous analytics.
            </p>
          </div>

          <div className="space-y-8 mt-8">
            <div className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full mr-3">
                  <Settings size={16} />
                </div>
                Managing Cookies
              </h2>
              <p className="mt-3 text-slate-600 pl-11">
                You can clear or block cookies in your browser settings. Some
                features (like login) may stop working if you do.
              </p>

              <div className="mt-4 ml-11 p-3 bg-slate-50 border border-slate-100 rounded-md">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-emerald-600">Tip:</span>{" "}
                  Most browsers allow you to manage cookies in the "Privacy" or
                  "Security" section of the settings menu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block fixed bottom-0 right-0 w-64 h-64 bg-emerald-100 rounded-full opacity-20 -z-10 translate-x-1/4 translate-y-1/4"></div>
    </div>
  );
}
