"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Bot,
  LineChart,
  UsersRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const featureCards = [
  {
    title: "Sentence-Level Intelligence",
    description:
      "TruthLens inspects every sentence in your notes, flags shaky knowledge, and links back to trustworthy references instantly.",
    icon: ShieldCheck,
  },
  {
    title: "Adaptive Learning Coach",
    description:
      "AI-generated prompts, quizzes, and correction suggestions keep the learning loop moving without you leaving the document.",
    icon: Bot,
  },
  {
    title: "Shared Learning Spaces",
    description:
      "Collaborative canvases let classmates or teammates co-edit notebooks while TruthLens tracks agreements, questions, and follow-ups.",
    icon: UsersRound,
  },
];

const timelineSteps = [
  {
    title: "Capture",
    copy: "Import lecture notes, meeting transcripts, or quick thoughts. TruthLens indexes every sentence the moment it lands.",
  },
  {
    title: "Understand",
    copy: "AI highlights misconceptions, knowledge gaps, and missing context so you can focus on what needs reinforcement.",
  },
  {
    title: "Refine",
    copy: "Accept corrections, attach sources, and turn tricky sentences into flashcards or follow-up tasks.",
  },
  {
    title: "Share",
    copy: "Publish living study guides or briefing packs with tracked changes and insight summaries for your team.",
  },
];

const sentimentData = [
  { month: "Jan", accuracy: 62, velocity: 18 },
  { month: "Feb", accuracy: 68, velocity: 22 },
  { month: "Mar", accuracy: 74, velocity: 29 },
  { month: "Apr", accuracy: 81, velocity: 35 },
  { month: "May", accuracy: 86, velocity: 42 },
  { month: "Jun", accuracy: 90, velocity: 47 },
];

const testimonials = [
  {
    name: "N. Castillo",
    role: "Learning Lead, Horizon Academy",
    quote:
      "TruthLens transformed our study groups. Sentence flags point straight at misconceptions, saving hours of re-reading.",
  },
  {
    name: "Kira Wells",
    role: "Research Analyst, Meridian Labs",
    quote:
      "We capture insights once and let TruthLens keep them evergreen. Corrections arrive with references before meetings even start.",
  },
];

export default function Home() {
  const chartGradient = useMemo(
    () => (
      <defs>
        <linearGradient id="accuracyGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.6} />
          <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="velocityGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
        </linearGradient>
      </defs>
    ),
    [],
  );

  return (
    <div className="bg-gradient-to-b from-background via-background to-muted/40">
      <section className="container grid gap-10 pb-20 pt-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
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
              <Link href="/auth/register">
                Create my workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/auth/login">Open my notes</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:flex sm:items-center sm:gap-10">
            <div>
              <p className="text-3xl font-semibold">84%</p>
              <p className="text-sm text-muted-foreground">Average recall lift after four study cycles with active sentence reviews.</p>
            </div>
            <Separator orientation="vertical" className="hidden h-12 sm:block" />
            <div>
              <p className="text-3xl font-semibold">6×</p>
              <p className="text-sm text-muted-foreground">Faster from capture to clarity thanks to automated corrections and sources.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
        >
          <Card className="border-0 bg-card/70 shadow-xl ring-1 ring-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <LineChart className="size-5 text-primary" />
                Learning momentum snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentData}>
                    {chartGradient}
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                      }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--chart-3))"
                      fill="url(#accuracyGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="velocity"
                      stroke="hsl(var(--chart-2))"
                      fill="url(#velocityGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Mastery trend</p>
                  <p className="text-xl font-semibold">+24 pts</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revision pace</p>
                  <p className="text-xl font-semibold">2.1× lift</p>
                </div>
              </div>
            </CardContent>
          </Card>
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

      <section id="workflow" className="container grid gap-10 pb-24 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <Badge className="w-fit bg-secondary text-secondary-foreground">
            Learning loop
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">From capture to mastery in four beats.</h2>
          <p className="text-muted-foreground">
            Every stage is built for calm focus, from drafting ideas to locking in understanding and sharing polished
            study packs with the people who need them.
          </p>
          <Tabs defaultValue="capture" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="capture">Active notes</TabsTrigger>
              <TabsTrigger value="report">Revision packs</TabsTrigger>
            </TabsList>
            <TabsContent value="capture" className="space-y-3 rounded-lg border border-border/60 bg-card/70 p-5">
              <h3 className="font-medium">Live annotations with context-aware coaching.</h3>
              <p className="text-sm text-muted-foreground">
                Capture questions, tasks, and aha moments inline. TruthLens nudges you toward clarifying prompts based
                on the sentence you are reading.
              </p>
            </TabsContent>
            <TabsContent value="report" className="space-y-3 rounded-lg border border-border/60 bg-card/70 p-5">
              <h3 className="font-medium">Snapshot knowledge, ready to revisit.</h3>
              <p className="text-sm text-muted-foreground">
                Spin up summaries, flashcards, and spaced-repetition queues using the sentences TruthLens already
                understands. Staying sharp becomes automatic.
              </p>
            </TabsContent>
          </Tabs>
        </div>
        <div className="grid gap-6 rounded-xl border border-border/60 bg-card/60 p-6">
          {timelineSteps.map((step, index) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="rounded-full border border-primary/40 bg-primary/10 p-2 text-primary">
                  <CheckCircle2 className="size-5" />
                </div>
                {index !== timelineSteps.length - 1 && (
                  <div className="mt-2 h-full w-px flex-1 bg-border" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-wide text-primary/80">Step {index + 1}</p>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="insights" className="container grid gap-10 pb-32 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <Badge variant="outline" className="w-fit">
            Learning intelligence
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Always know which concept needs help next.</h2>
          <p className="text-muted-foreground">
            Live mastery, confidence, and freshness scores spotlight the sentences that deserve another pass. The same
            pipelines feed your automations, so studio dashboards and API calls stay perfectly aligned.
          </p>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Concept heatmaps that reveal which topics or chapters need a refresh.
            </li>
            <li className="flex items-center gap-2">
              <Bot className="size-4 text-primary" />
              Auto-generated corrections and follow-up questions sourced from trusted knowledge bases.
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Signal-based nudges that remind you to revisit material before confidence dips.
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card to-card/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Knowledge drift monitor
                <ThemeToggle />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-border/50 bg-background/60 p-4 text-sm text-muted-foreground">
                "Our students walk into exams calm. TruthLens tells them exactly which sentences to wrestle with each morning."
              </div>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>HS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Hollis Shaw</p>
                  <p className="text-xs text-muted-foreground">Director of Learning, Align Labs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

    </div>
  );
}
