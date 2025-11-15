import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TruthLens. Built to help students factcheck their notes.
          </p>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Link href="https://github.com/sofiagzzloz/truthlens" className="transition hover:text-primary">
            <Github className="size-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
