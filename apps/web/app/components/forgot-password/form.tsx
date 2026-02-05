"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Link,
  Form,
} from "@repo/ui";
import z from "zod";
import { useForgotPassword } from "~/hooks";
import { ALL_ROUTES } from "~/routes";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm: React.FC = () => {
  const { forgotPasswordMutation, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    forgotPasswordMutation(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-default-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-4">
          <h1 className="text-2xl text-center font-bold">Forgot Password</h1>
          <p className="text-sm text-default-500">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              {...register("email")}
              isRequired
              variant="bordered"
              autoComplete="email"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <Button
              type="submit"
              color="primary"
              isLoading={isPending}
              className="w-full"
            >
              Send Reset Link
            </Button>

            <div className="text-center text-sm">
              <span className="text-default-500">Remember your password? </span>
              <Link href={ALL_ROUTES.login} size="sm" className="text-primary">
                Sign in
              </Link>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
