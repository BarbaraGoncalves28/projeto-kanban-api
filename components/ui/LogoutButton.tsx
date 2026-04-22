"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/login");
  }

  return (
    <Button className="cursor-pointer" type="button" onClick={handleLogout} loading={isLoading}>
      Sair
    </Button>
  );
}
