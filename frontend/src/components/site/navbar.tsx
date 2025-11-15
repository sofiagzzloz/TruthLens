"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Menu, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const links = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#insights", label: "Insights" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "TL";

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="size-6 text-primary" />
          <span>TruthLens</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {links.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      "hover:text-primary",
                    )}
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            {ready && user ? (
              <>
                <Button variant="ghost" asChild className="hidden md:inline-flex">
                  <Link href="/workspace">My workspace</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="size-8">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden text-sm font-medium sm:inline">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        router.push("/workspace");
                      }}
                    >
                      Open workspace
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        router.push("/account");
                      }}
                    >
                      Account settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(event) => {
                        event.preventDefault();
                        handleLogout();
                      }}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href={pathname?.startsWith("/auth") ? "/" : "/auth/login"}>
                    {pathname?.startsWith("/auth") ? "Back to app" : "Log in"}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register" className="flex items-center gap-1">
                    Get started
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader className="items-start">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-primary" /> TruthLens
              </SheetTitle>
              <SheetDescription>
                Navigate through TruthLens and explore how we help you ship trustworthy
                content faster.
              </SheetDescription>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-4">
              {links.map((link) => (
                <motion.span
                  key={link.href}
                  whileHover={{ x: 4 }}
                  className="text-sm font-medium"
                >
                  <Link href={link.href}>{link.label}</Link>
                </motion.span>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              {ready && user ? (
                <>
                  <Button asChild>
                    <Link href="/workspace">Open workspace</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/account">Account settings</Link>
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register" className="flex items-center gap-1">
                      Get started
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
