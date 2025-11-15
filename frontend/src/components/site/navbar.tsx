"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Menu, ArrowRight } from "lucide-react";

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

const links = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#insights", label: "Insights" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();

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
            <ThemeToggle />
          </div>
        </div>

        <Sheet>
          <SheetTrigger className="lg:hidden" aria-label="Open navigation">
            <Button variant="ghost" size="icon">
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
              <Button variant="outline" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register" className="flex items-center gap-1">
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
