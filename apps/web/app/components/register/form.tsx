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
import { useRegister } from "~/hooks";
import { ALL_ROUTES } from "~/routes";
import { passwordSchema } from "~/lib";

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);

  const { registerMutation, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation(data);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const togglePasswordConfirmVisibility = () => {
    setIsPasswordConfirmVisible(!isPasswordConfirmVisible);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-default-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-default-500">
            Sign up to get started with our platform
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <Form
            validationBehavior="native"
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
              description="We'll never share your email with anyone"
            />

            <Input
              type="text"
              label="Username"
              placeholder="Choose a username"
              {...register("username")}
              isRequired
              variant="bordered"
              autoComplete="username"
              isInvalid={!!errors.username}
              errorMessage={errors.username?.message}
              description="3-20 characters, letters, numbers and underscores only"
            />

            <Input
              label="Password"
              placeholder="Create a strong password"
              {...register("password")}
              isRequired
              variant="bordered"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              description="At least 8 characters with uppercase, lowercase, number and symbol"
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
              label="Confirm Password"
              placeholder="Re-enter your password"
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

            <div className="text-xs text-default-500 px-1">
              By signing up, you agree to our{" "}
              <Link href="#" size="sm" className="text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" size="sm" className="text-primary">
                Privacy Policy
              </Link>
            </div>

            <Button
              type="submit"
              color="primary"
              isLoading={isPending}
              className="w-full"
            >
              Create Account
            </Button>

            <div className="text-center text-sm">
              <span className="text-default-500">
                Already have an account?{" "}
              </span>
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

export default RegisterForm;
