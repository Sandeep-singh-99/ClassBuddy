import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        {/* Brand Section */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-3">ClassBuddy</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Your AI-powered study companion – helping students learn smarter,
            faster, and effortlessly.
          </p>
          {/* Social Icons */}
          <div className="flex gap-4 mt-4">
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-yellow-500 transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="hover:text-yellow-500 transition-colors"
            >
              <Github size={20} />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-yellow-500 transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="mailto:hello@classbuddy.ai"
              aria-label="Email"
              className="hover:text-yellow-500 transition-colors"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-gray-900 font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Download
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-900 font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="text-gray-900">ClassBuddy</span>. All rights reserved.
      </div>
    </footer>
  );
}
