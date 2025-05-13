import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-emerald-800 text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo */}
        <div>
          <Link to="/" className="font-logo text-3xl leading-none">
            holidaze
          </Link>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Company</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/about">About us</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Support</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Legal</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/cookies">Cookies</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
