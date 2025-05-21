import { Link } from "react-router-dom";
import { ArrowLeft, Home, Plane, Code } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 font-medium text-emerald-600 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Link>
      <div className="container mx-auto max-w-3xl">
        <div className="relative mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">
            About Holidaze
          </h1>
          <div className="mt-2 mx-auto w-20 h-1 bg-emerald-500 rounded-full"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <div className="flex justify-center gap-6 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full">
              <Home size={20} />
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full">
              <Plane size={20} />
            </div>
          </div>

          <div className="space-y-6 text-center">
            <p className="text-lg text-slate-700 leading-relaxed">
              Holidaze began with a single goal: make booking unique stays
              effortless for travellers{" "}
              <em className="text-emerald-600 font-medium not-italic">and</em>{" "}
              venue hosts.
            </p>

            <p className="text-slate-700">
              Thanks for stopping by—and happy travelling!
            </p>
          </div>
        </div>
      </div>

      <div className="hidden sm:block fixed bottom-0 right-0 w-64 h-64 bg-emerald-100 rounded-full opacity-20 -z-10 translate-x-1/4 translate-y-1/4"></div>
    </div>
  );
}
