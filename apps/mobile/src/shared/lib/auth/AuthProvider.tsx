import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { IS_DEMO_MODE } from "../constants";
import { auth } from "../firebase/client";

export type AuthUser = {
  uid: string;
  email: string | null;
};

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => void;
  signOutUser: () => Promise<void>;
};

const DEMO_USER: AuthUser = { uid: "demo-user", email: null };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [firebaseUser, setFirebaseUser] = useState<AuthUser | null>(null);
  const [demoUser, setDemoUser] = useState<AuthUser | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<AuthStatus>("loading");

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setFirebaseUser(nextUser ? { uid: nextUser.uid, email: nextUser.email } : null);
        setFirebaseStatus(nextUser ? "authenticated" : "guest");
      }),
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signInDemo = useCallback(() => {
    if (!IS_DEMO_MODE) return;
    setDemoUser(DEMO_USER);
  }, []);

  const signOutUser = useCallback(async () => {
    if (demoUser) {
      setDemoUser(null);
      return;
    }
    await signOut(auth);
  }, [demoUser]);

  const user = demoUser ?? firebaseUser;
  const status: AuthStatus = demoUser ? "authenticated" : firebaseStatus;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isDemoMode: IS_DEMO_MODE,
      signIn,
      signInDemo,
      signOutUser,
    }),
    [signIn, signInDemo, signOutUser, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
