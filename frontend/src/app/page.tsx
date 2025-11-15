"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Bot,
  UsersRound,
} from "lucide-react";

const featureCards = [
  {
    title: "Sentence-Level Intelligence",
    description:
      "TruthLens inspects every sentence in your notes, flags shaky knowledge, and links back to trustworthy references instantly.",
    icon: ShieldCheck,
  },
  {
    title: "AI-Powered Fact Checks",
    description:
      "Run TruthLens on any draft to surface misinformation, receive grounded corrections, and cite reliable sources without leaving your notebook.",
    icon: Bot,
  },
  {
    title: "Effortless Corrections",
    description:
      "Obtain refined notes with confidence that every claim has been verified.",
    icon: UsersRound,
  },
];

export default function Home() {
  const { user, ready } = useAuth();

  return (
    <div className="bg-gradient-to-b from-background via-background to-muted/40">
      <section className="container pb-20 pt-16">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          <Badge className="inline-flex items-center gap-2 bg-primary/10 text-primary">
            <Sparkles className="size-4" />
            Automate your learning loop
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Turn messy notes into a guided learning system.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            TruthLens captures every sentence you write, diagnoses weak spots, and keeps your learning queue prioritized.
            Build knowledge faster while the platform tracks citations, corrections, and next actions for you.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href={ready && user ? "/workspace" : "/auth/register"}>
                {ready && user ? "Go to workspace" : "Create my workspace"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href={ready && user ? "/workspace" : "/auth/login"}>
                {ready && user ? "Open workspace" : "Open my notes"}
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section id="features" className="container space-y-12 pb-24">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit">
            Built for knowledge builders
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">A note workspace that thinks with you.</h2>
          <p className="max-w-3xl text-muted-foreground">
            TruthLens blends sentence-aware AI with calm UI patterns so you can capture ideas, surface confusion,
            and act on insights without breaking flow.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="h-full"
            >
              <Card className="h-full border-border/60 bg-card/80">
                <CardHeader className="flex flex-row items-center gap-3">
                  <feature.icon className="size-6 text-primary" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {feature.description}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
