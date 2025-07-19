"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/services/loadingScreen";

export default function ApartamentsRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/home");
      } else if ([1, 3].includes(user.nivelAcesso)) {
        router.push("/report/desktop");
      } else {
        router.push("/report/mobile");
      }
    }
  }, [user, loading, router]);

      return <LoadingScreen message="Carregando, por favor aguarde..." />;
}
