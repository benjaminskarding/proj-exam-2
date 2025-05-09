import { Link } from "react-router-dom";

function Footer() {
  return (
    <header className="bg-emerald-800 text-white">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-3xl font-logo leading-none">
          holidaze
        </Link>

        <nav className="flex items-center gap-6 text-lg leading-none">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        <span className="text-3xl font-logo leading-none text-transparent select-none">
          holidaze
        </span>
      </div>
    </header>
  );
}

export default Footer;
