import { router } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "../lib/auth";

export function useRequireAuth() {
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status]);

  return { isReady: status === "authenticated" && user !== null, user };
}
