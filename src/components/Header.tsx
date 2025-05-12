import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const nav = useNavigate();
  const { role, name, avatarUrl, logout } = useAuth();

  function handleLogout() {
    logout();
    nav("/");
  }

  return (
    <header className="bg-emerald-800 text-white">
      <div
        className="mx-auto flex h-14 sm:h-16 items-center justify-between
                   px-3 sm:px-6 md:px-8 max-w-screen-xl"
      >
        {/* logo */}
        <Link
          to="/"
          className="font-logo leading-none text-2xl sm:text-3xl md:text-4xl"
        >
          holidaze
        </Link>

        {/* nav */}
        {role === "visitor" ? (
          <nav
            className="flex items-center
                       gap-3 sm:gap-4 md:gap-6
                       text-xs sm:text-sm md:text-base leading-none"
          >
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
        ) : (
          <nav
            className="flex items-center
                       gap-3 sm:gap-4 md:gap-6
                       text-xs sm:text-sm md:text-base leading-none"
          >
            <Link to="/profile" className="flex items-center gap-2">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={`${name} avatar`}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                />
              )}
              <span>{name}</span>
            </Link>

            {role === "manager" ? (
              <Link to="/manage">Manage Venues</Link>
            ) : (
              <Link to="/bookings">My bookings</Link>
            )}

            <button onClick={handleLogout} className="hover:underline">
              Log&nbsp;out
            </button>
          </nav>
        )}

        {/* spacer — hidden below md to free width */}
        <h1
          className="hidden md:block select-none font-logo
                     text-2xl md:text-4xl leading-none text-transparent"
        >
          holidaze
        </h1>
      </div>
    </header>
  );
}

export default Header;
