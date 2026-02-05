"use client";

import { useState } from "react";
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
import { EyeIcon, EyeSlashIcon } from "@repo/ui/icons";
import z from "zod";
import { useResetPassword } from "~/hooks";
import { ALL_ROUTES } from "~/routes";
import { passwordSchema } from "~/lib/validation";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);
  const { resetPasswordMutation, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    resetPasswordMutation({
      token,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const togglePasswordConfirmVisibility = () => {
    setIsPasswordConfirmVisible(!isPasswordConfirmVisible);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-default-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-4">
          <h1 className="text-2xl text-center font-bold">Reset Password</h1>
          <p className="text-sm text-default-500">
            Enter your new password below
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="New Password"
              placeholder="Enter your new password"
              {...register("password")}
              isRequired
              variant="bordered"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label="toggle password visibility"
                >
                  {isPasswordVisible ? (
                    <EyeSlashIcon className="w-5 h-5 text-default-400 pointer-events-none" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />

            <Input
              label="Confirm New Password"
              placeholder="Confirm your new password"
              {...register("passwordConfirm")}
              isRequired
              variant="bordered"
              type={isPasswordConfirmVisible ? "text" : "password"}
              autoComplete="new-password"
              isInvalid={!!errors.passwordConfirm}
              errorMessage={errors.passwordConfirm?.message}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={togglePasswordConfirmVisibility}
                  aria-label="toggle password confirmation visibility"
                >
                  {isPasswordConfirmVisible ? (
                    <EyeSlashIcon className="w-5 h-5 text-default-400 pointer-events-none" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              color="primary"
              isLoading={isPending}
              className="w-full"
            >
              Reset Password
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

export default ResetPasswordForm;
