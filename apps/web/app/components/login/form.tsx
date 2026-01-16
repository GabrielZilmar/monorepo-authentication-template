"use client";

import { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader, Link } from "@repo/ui";
import { EyeIcon, EyeSlashIcon } from "@repo/ui/icons";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Login attempt:", { email, password });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-default-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-default-500">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onValueChange={setEmail}
              isRequired
              variant="bordered"
              autoComplete="email"
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onValueChange={setPassword}
              isRequired
              variant="bordered"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
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
              isLoading={isLoading}
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
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default LoginForm;
