"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/services/loadingScreen";

export default function AccessLogRedirect() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if ([1, 3].includes(Number(user?.nivelAcesso) || 0)) {
        router.push("/home/desktop");
      } else {
        router.push("/home/mobile");
      }
    }
  }, [user, loading, router, isAuthenticated]);

  return <LoadingScreen message="Carregando, por favor aguarde..." />;
}

