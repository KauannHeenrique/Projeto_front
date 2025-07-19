"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/services/loadingScreen";

export default function AccessLogRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/accessLog");
      } else if ([1, 3].includes(user.nivelAcesso)) {
        router.push("/accessLog/desktop");
      } else {
        router.push("/accessLog/mobile");
      }
    }
  }, [user, loading, router]);

  return <LoadingScreen message="Carregando, por favor aguarde..." />;
}

