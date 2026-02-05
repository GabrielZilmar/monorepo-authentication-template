"use client";

import { useEffect, Suspense } from "react";
import { useVerifyEmail } from "~/hooks/use-verify-email";

function VerifyEmailContent() {
  const { verifyEmailFromParams, isPending } = useVerifyEmail();

  useEffect(() => {
    verifyEmailFromParams();
  }, [verifyEmailFromParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {isPending ? (
          <div>
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent text-white"></div>
            <p>Verifying your email...</p>
          </div>
        ) : (
          <div>
            <h1 className="text-white mb-4 text-2xl font-bold">
              Email Verification
            </h1>
            <p className="text-white">
              Please wait while we verify your email address.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
