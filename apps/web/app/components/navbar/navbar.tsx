"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Navbar as NavbarUI,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@repo/ui";
import { useUserStore } from "~/store/user";
import { useLogout } from "~/hooks";

type MenuItem = {
  name: string;
  href: string;
};

export default function Navbar() {
  const { user } = useUserStore();
  const { logoutMutation, isPending } = useLogout();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const handleLogout = () => {
    logoutMutation();
  };

  return (
    <NavbarUI
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-background/60 backdrop-blur-md"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <p className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MyApp
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-8" justify="start">
        <NavbarBrand>
          <p className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MyApp
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.href} isActive={pathname === item.href}>
            <Link
              color={pathname === item.href ? "primary" : "foreground"}
              href={item.href}
              className="font-medium"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user?.username}
                size="sm"
                showFallback
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Profile Actions"
              variant="flat"
              disabledKeys={
                isPending
                  ? ["settings", "help_and_feedback", "logout"]
                  : ["settings", "help_and_feedback"]
              }
            >
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user?.email || ""}</p>
              </DropdownItem>
              <DropdownItem key="username" className="h-10 gap-2">
                <p className="text-sm text-default-500">
                  @{user?.username || ""}
                </p>
              </DropdownItem>
              <DropdownItem key="settings">Settings</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                {isPending ? "Logging out..." : "Log Out"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              className="w-full"
              color={pathname === item.href ? "primary" : "foreground"}
              href={item.href}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </NavbarUI>
  );
}
