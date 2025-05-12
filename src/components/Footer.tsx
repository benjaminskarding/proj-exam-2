import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-emerald-800 text-white">
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 px-4 py-4 sm:py-0 max-w-screen-xl">
        <Link to="/" className="font-logo leading-none text-2xl sm:text-3xl">
          holidaze
        </Link>

        <nav className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-lg leading-none">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        {/* spacer */}
        <span className="font-logo leading-none text-2xl sm:text-3xl text-transparent select-none">
          holidaze
        </span>
      </div>
    </footer>
  );
}

export default Footer;
