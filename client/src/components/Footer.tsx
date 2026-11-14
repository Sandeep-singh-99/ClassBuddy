import { Github, Twitter, Linkedin, Mail, Command } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-card border-t border-black/[0.08] dark:border-white/[0.08] text-muted-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs">
                <Command className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                ClassBuddy
              </span>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              The AI operating system for modern academic workflows. Synthesizing
              lectures, testing retention, and automating evaluations.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:support@classbuddy.ai"
                aria-label="Email"
                className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-mono uppercase tracking-wider text-foreground font-semibold">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Capabilities
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-foreground transition-colors">
                  Showcase
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-mono uppercase tracking-wider text-foreground font-semibold">
              Platform
            </h4>
            <ul className="space-y-2">
              <li className="text-muted-foreground">Students & Cohorts</li>
              <li className="text-muted-foreground">Educator Portals</li>
              <li className="text-muted-foreground">Rubric Auto-Grading</li>
              <li className="text-muted-foreground">AI Mock Interviews</li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-mono uppercase tracking-wider text-foreground font-semibold">
              Security
            </h4>
            <ul className="space-y-2">
              <li className="text-muted-foreground">RFC 7636 PKCE</li>
              <li className="text-muted-foreground">Tenant Privacy</li>
              <li className="text-muted-foreground">Terms of Service</li>
              <li className="text-muted-foreground">Privacy Policy</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-muted-foreground">
          <p>© 2026 ClassBuddy AI Inc. All rights reserved.</p>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted border border-black/[0.06] dark:border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
