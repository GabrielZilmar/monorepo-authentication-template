import dynamic from "next/dynamic";

export const ClientAvatar = dynamic(
  () => import("@repo/ui").then((m) => m.Avatar),
  { ssr: false },
);
