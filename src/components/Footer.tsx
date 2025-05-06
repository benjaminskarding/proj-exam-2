import { Link } from "react-router-dom";

function Footer() {
  return (
    <header className="bg-emerald-800 text-white">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        {/* real logo (left) */}
        <Link to="/" className="text-3xl font-logo leading-none">
          holidaze
        </Link>

        {/* auth links (centre) */}
        <nav className="flex items-center gap-6 text-lg leading-none">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        {/* invisible clone for centering and SEO-crawlers */}
        <span className="text-3xl font-logo leading-none text-transparent select-none">
          holidaze
        </span>
      </div>
    </header>
  );
}

export default Footer;
