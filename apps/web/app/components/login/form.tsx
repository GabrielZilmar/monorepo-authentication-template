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

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // TODO: Implement authentication logic
      console.log("Login attempt:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-default-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-default-500">
            Sign in to your account to continue
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

            <Input
              label="Password"
              placeholder="Enter your password"
              {...register("password")}
              isRequired
              variant="bordered"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
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

            <div className="flex justify-end">
              <Link href="#" size="sm" className="text-primary">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              color="primary"
              isLoading={isSubmitting}
              className="w-full"
            >
              Sign in
            </Button>

            <div className="text-center text-sm">
              <span className="text-default-500">Don't have an account? </span>
              <Link href="#" size="sm" className="text-primary">
                Sign up
              </Link>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default LoginForm;
