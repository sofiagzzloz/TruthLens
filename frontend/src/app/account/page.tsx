"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Lock, Sparkles, Trash2 } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  profileSchema,
  passwordChangeSchema,
  type ProfileValues,
  type PasswordChangeValues,
} from "@/lib/validators";
import {
  changeUserPassword,
  deleteUserAccount,
  updateUserProfile,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function AccountPage() {
  const router = useRouter();
  const { user, ready, setUser, logout } = useAuth();

  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/auth/login");
    }
  }, [ready, user, router]);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? "",
      email: user?.email ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ username: user.username, email: user.email });
    }
  }, [user, profileForm]);

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const summaryItems = useMemo(
    () => [
      { label: "Username", value: user?.username ?? "—" },
      { label: "Email", value: user?.email ?? "—" },
    ],
    [user],
  );

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleProfileSubmit = (values: ProfileValues) => {
    startProfileTransition(async () => {
      try {
        const updated = await updateUserProfile(user.user_id, values);
        setUser(updated);
        profileForm.reset({ username: updated.username, email: updated.email });
        toast.success("Account details updated");
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Unable to update account");
      }
    });
  };

  const handlePasswordSubmit = (values: PasswordChangeValues) => {
    startPasswordTransition(async () => {
      try {
        await changeUserPassword(user.user_id, {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        passwordForm.reset({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        toast.success("Password updated");
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Unable to update password");
      }
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Deleting your TruthLens account removes all notebooks and learning progress. Continue?",
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserAccount(user.user_id);
      logout();
      toast.success("Account deleted");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-2xl space-y-3">
        <Badge variant="outline" className="w-fit">
          Account
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Account & security</h1>
        <p className="text-muted-foreground">
          Tune how TruthLens supports your learning flow. Update profile details, rotate credentials, and keep your
          workspace tidy from one place.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Profile information</CardTitle>
            <CardDescription>Update how teammates and study partners see you inside shared workspaces.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="grid gap-5">
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="alex@learnhq.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-fit" disabled={profilePending}>
                  {profilePending ? "Saving changes…" : "Save changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Learning workspace snapshot
            </CardTitle>
            <CardDescription>Sneak peek at how TruthLens currently greets you in shared notebooks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border/60 bg-background/70 p-4">
              Keep sentences sharp by committing edits right after sessions. TruthLens queues fresh prompts based on the
              gaps it spots here.
            </div>
            <div className="space-y-3 text-sm">
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="size-5 text-primary" /> Change password
            </CardTitle>
            <CardDescription>Switch things up regularly to keep your notebooks and insights secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="grid gap-5">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="New secure password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="Repeat new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-fit" disabled={passwordPending}>
                  {passwordPending ? "Updating…" : "Update password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-destructive/10 text-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" /> Delete account
            </CardTitle>
            <CardDescription className="text-sm text-destructive/80">
              This action cannot be undone. All notebooks, sentences, and corrections will be removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              If you&apos;re wrapping up a cohort or migrating work elsewhere, export your documents first. You can always
              return to TruthLens when you&apos;re ready.
            </p>
            <Button
              type="button"
              variant="destructive"
              className="w-fit"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete account"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
