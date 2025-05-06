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
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-3xl font-logo leading-none">
          holidaze
        </Link>

        {role === "visitor" ? (
          <nav className="flex items-center gap-6 text-lg leading-none">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
        ) : (
          <nav className="flex items-center gap-6 text-lg leading-none">
            <Link to="/profile" className="flex items-center gap-2">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={`${name} avatar`}
                  className="h-8 w-8 rounded-full object-cover"
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
              Log out
            </button>
          </nav>
        )}

        <h1 className="select-none font-logo text-3xl leading-none text-transparent">
          holidaze
        </h1>
      </div>
    </header>
  );
}

export default Header;
