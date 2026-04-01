"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loader from "@/components/ui/Loader";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/signin");
      return;
    }

    router.replace("/explore");
  }, [session, status, router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}
