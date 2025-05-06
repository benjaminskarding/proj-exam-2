import { createContext, useContext, useEffect, useState } from "react";

export type Role = "visitor" | "customer" | "manager";

export type LoginInfo = {
  role: Role;
  name: string;
  avatarUrl?: string;
  token: string;
  venueManager?: boolean;
};

// Context expose
type AuthShape = LoginInfo & {
  login: (info: LoginInfo) => void;
  logout: () => void;
};

const AuthCtx = createContext<AuthShape | null>(null);
export const useAuth = () => useContext(AuthCtx)!;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  /* empty state = visitor */
  const [state, setState] = useState<AuthShape>({
    role: "visitor",
    name: "",
    avatarUrl: undefined,
    token: "",
    venueManager: false,
    login: noop,
    logout: noop,
  });

  function login(info: LoginInfo) {
    localStorage.setItem("auth", JSON.stringify(info));
    setState({ ...info, venueManager: !!info.venueManager, login, logout });
  }

  function logout() {
    localStorage.removeItem("auth");
    setState({
      role: "visitor",
      name: "",
      avatarUrl: undefined,
      token: "",
      venueManager: false,
      login,
      logout,
    });
  }

  /* restore session on reload */
  useEffect(() => {
    const cached = localStorage.getItem("auth");
    if (cached) {
      try {
        login(JSON.parse(cached));
      } catch {}
    }
  }, []);

  return (
    <AuthCtx.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

function noop() {}
