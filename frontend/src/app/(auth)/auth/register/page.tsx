"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { registerSchema, type RegisterValues } from "@/lib/validators";
import { registerUser } from "@/lib/api";
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

const samplePromises = [
  "Sentence-level mastery tracking",
  "AI study prompts and corrections",
  "Shared learning workspaces",
];

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: RegisterValues) => {
    startTransition(async () => {
      try {
        const user = await registerUser(values);
        toast.success(`Welcome, ${user.username}! Log in to start your guided learning loop.`);
        router.push("/auth/login");
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Could not create account");
      }
    });
  };

  return (
    <div className="grid gap-8 rounded-2xl border border-border/70 bg-card/80 p-8 shadow-xl backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-semibold">Create your TruthLens workspace</CardTitle>
          <CardDescription className="text-base">
            Capture notes once and let TruthLens surface misunderstandings, suggest follow-ups, and keep your learning path organized.
          </CardDescription>
        </div>
        <Card className="border-border/60 bg-background/60">
          <CardHeader>
            <CardTitle className="text-lg">Why learners choose TruthLens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {samplePromises.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <UserPlus className="size-4 text-primary" />
                {item}
              </div>
            ))}
            <Separator />
            <p>
              Trusted by study cohorts, research teams, and knowledge workers who need living documents that stay accurate.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-background/90 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold">Sign up</CardTitle>
          <CardDescription>Set up your hub for smarter notes, instant corrections, and shared insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="study-studio" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="editor@truthlens.ai" autoComplete="email" {...field} />
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
                      <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full gap-2" size="lg" disabled={isPending}>
                <UserPlus className="size-5" />
                {isPending ? "Creating workspace…" : "Create account"}
              </Button>
            </form>
          </Form>
          <Separator className="my-6" />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Log in instead
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
