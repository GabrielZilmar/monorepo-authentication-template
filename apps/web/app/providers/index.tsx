"use client";

import { HeroUIProvider, ToastProvider } from "@repo/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RootProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </HeroUIProvider>
  );
};

export default RootProvider;
