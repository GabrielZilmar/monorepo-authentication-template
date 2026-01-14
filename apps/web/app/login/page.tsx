"use client";

import { Button } from "@repo/ui";

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-2">
      <h1>Hello World</h1>
      <div className="flex gap-8">
        <Button color="default">Default</Button>
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="success">Success</Button>
        <Button color="warning">Warning</Button>
        <Button color="danger">Danger</Button>
      </div>
    </div>
  );
}
