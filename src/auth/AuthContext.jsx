import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { unwrap } from "../api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => setUser(unwrap(r)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const r = await api.post("/auth/login", payload);
        setUser(unwrap(r));
      },
      async signup(payload) {
        return unwrap(await api.post("/auth/signup", payload));
      },
      async logout() {
        await api.post("/auth/logout");
        setUser(null);
      },
      async refresh() {
        const r = await api.get("/auth/me");
        setUser(unwrap(r));
        return unwrap(r);
      },
    }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
