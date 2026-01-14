"use client";

import { HeroUIProvider } from "@repo/ui";
import { useRouter } from "next/navigation";

const RootProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();

  return <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>;
};

export default RootProvider;
