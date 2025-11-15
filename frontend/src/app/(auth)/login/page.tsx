"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

import { loginSchema, type LoginValues } from "@/lib/validators";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginValues) => {
    startTransition(async () => {
      try {
        const user = await loginUser(values);
        setUser(user);
        toast.success(`Welcome back, ${user.username}!`);
        router.push("/");
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Unable to log in");
      }
    });
  };

  return (
    <Card className="relative overflow-hidden border-border/70 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold">Log in to TruthLens</CardTitle>
        <CardDescription>
          Rejoin your fact-checking workspace to keep narratives aligned with reality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or username</FormLabel>
                  <FormControl>
                    <Input placeholder="alex@newsroom.com" autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full gap-2" size="lg" disabled={isPending}>
              <LogIn className="size-5" />
              {isPending ? "Checking credentials…" : "Log in"}
            </Button>
          </form>
        </Form>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/auth/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Create one now
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
