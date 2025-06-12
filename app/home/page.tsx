"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function HomeRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.nivelAcesso === 3 || user.nivelAcesso === 1) {
        router.push("/home/desktop");
      } else {
          router.push("/home/mobile");
      }
    }
  }, [user, loading, router]);

  return <p className="text-center mt-20 text-gray-500">Redirecionando...</p>;
}