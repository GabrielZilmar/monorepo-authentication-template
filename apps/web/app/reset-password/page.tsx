"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ResetPasswordForm from "~/components/reset-password/form";
import { Card, CardBody, CardHeader } from "@repo/ui";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-default-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-4">
            <h1 className="text-2xl text-center font-bold">Invalid Link</h1>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <p className="text-sm text-default-500 text-center">
              The password reset link is invalid or has expired. Please request
              a new password reset.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
