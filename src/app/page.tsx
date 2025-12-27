"use client";

import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SplashPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        router.replace(user ? "/home" : "/login");
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [router, user, loading]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#f0fff4] animate-in fade-in duration-1000">
      {loading && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
    </div>
  );
}
