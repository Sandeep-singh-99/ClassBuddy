import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-[#08101F] border-t border-border/50 text-muted-foreground relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12 relative z-10">
        {/* Brand Section */}
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500 mb-4 inline-block">ClassBuddy</h3>
          <p className="text-muted-foreground mb-6 text-[15px] leading-relaxed max-w-sm">
            Your AI-powered study companion – helping students learn smarter,
            faster, and effortlessly.
          </p>
          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            <a
              href="#"
              aria-label="Twitter"
              className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-300"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-300"
            >
              <Github size={20} />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-300"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="mailto:hello@classbuddy.ai"
              aria-label="Email"
              className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-300"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Links Container (Side by Side on Mobile) */}
        <div className="grid grid-cols-2 gap-8 lg:col-span-2">
          {/* Product */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-[15px]">Product</h4>
            <ul className="space-y-3 text-[14px]">
              <li>
                <a href="#" className="hover:text-primary transition-colors block">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors block">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors block">
                  Download
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-[15px]">Company</h4>
            <ul className="space-y-3 text-[14px]">
              <li>
                <a href="#" className="hover:text-primary transition-colors block">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors block">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors block">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40 text-center py-8 text-sm text-muted-foreground relative z-10">
        © {new Date().getFullYear()}{" "}
        <span className="text-foreground font-medium">ClassBuddy</span>. All rights reserved.
      </div>
    </footer>
  );
}
