"use client";

import { Button } from "@repo/ui";
import { useSendVerificationEmail } from "~/hooks/use-send-verification-email";

export const SendVerificationEmailButton = () => {
  const { sendEmailMutation, isPending } = useSendVerificationEmail();

  const handleSendEmail = () => {
    sendEmailMutation();
  };

  return (
    <Button onPress={handleSendEmail} isDisabled={isPending} color="primary">
      {isPending ? "Sending..." : "Send Verification Email"}
    </Button>
  );
};

export default SendVerificationEmailButton;
