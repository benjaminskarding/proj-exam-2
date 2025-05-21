import { createContext, useContext, useState, useCallback } from "react";

export type Role = "visitor" | "customer" | "manager";

export type LoginInfo = {
  role: Role;
  name: string;
  token: string;
  avatarUrl?: string;
  venueManager?: boolean;
};

type AuthShape = LoginInfo & {
  login: (i: LoginInfo) => void;
  logout: () => void;
};

// core context setup
const AuthCtx = createContext<AuthShape | null>(null);
export const useAuth = () => useContext(AuthCtx)!;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // load initial state from localStorage (only runs once)
  const [state, setState] = useState<Omit<AuthShape, "login" | "logout">>(
    () => {
      try {
        const cached = localStorage.getItem("auth");
        if (cached) return { ...JSON.parse(cached) } as LoginInfo;
      } catch {}
      return {
        role: "visitor",
        name: "",
        avatarUrl: undefined,
        token: "",
        venueManager: false,
      };
    }
  );

  // sets user state + caches to localStorage
  const login = useCallback((info: LoginInfo) => {
    localStorage.setItem("auth", JSON.stringify(info));
    setState({ ...info, venueManager: !!info.venueManager });
  }, []);

  // clears everything and resets to visitor mode
  const logout = useCallback(() => {
    localStorage.removeItem("auth");
    setState({
      role: "visitor",
      name: "",
      avatarUrl: undefined,
      token: "",
      venueManager: false,
    });
  }, []);

  return (
    <AuthCtx.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
