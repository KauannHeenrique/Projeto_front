"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/services/loadingScreen";
import Navigation from "./Navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  const publicRoutes = ["/login", "/changePassword"];

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) {
        return;
      }

      const isPublicRoute = publicRoutes.includes(pathname);

      if (isAuthenticated && isPublicRoute) {
        router.push("/home/desktop");
        return;
      }

      if (!isAuthenticated && !isPublicRoute) {
        router.push("/login");
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [user, loading, pathname, router, isAuthenticated]);

  if (isChecking || loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {children}
    </div>
  );
}
