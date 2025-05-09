import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

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
  const [state, setState] = useState<Omit<AuthShape, "login" | "logout">>({
    role: "visitor",
    name: "",
    avatarUrl: undefined,
    token: "",
    venueManager: false,
  });

  const login = useCallback((info: LoginInfo) => {
    localStorage.setItem("auth", JSON.stringify(info));
    setState({
      ...info,
      venueManager: !!info.venueManager,
    });
  }, []);

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

  useEffect(() => {
    const cached = localStorage.getItem("auth");
    if (cached) {
      try {
        login(JSON.parse(cached));
      } catch {}
    }
  }, [login]);

  return (
    <AuthCtx.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
