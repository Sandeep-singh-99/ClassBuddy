import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, User } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1729] via-[#13233f] to-[#0c1729] text-white flex items-center justify-center px-6 py-20">
      <div className="max-w-3xl w-full bg-[#111b30]/80 border border-gray-700 rounded-2xl shadow-xl p-10">
        
        
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-4 text-yellow-400">
          Contact Us
        </h1>
        <p className="text-gray-300 text-center mb-10">
          Have questions or feedback? We'd love to hear from you.  
          Fill out the form below and our team will get back to you.
        </p>

        {/* Contact Form */}
        <form className="space-y-6">
          <div className="flex items-center gap-3 bg-[#0f1d33] border border-gray-700 rounded-lg px-4 py-2">
            <User className="text-yellow-400" />
            <Input type="text" placeholder="Your Name" className="bg-transparent border-none focus-visible:ring-0 text-white" />
          </div>

          <div className="flex items-center gap-3 bg-[#0f1d33] border border-gray-700 rounded-lg px-4 py-2">
            <Mail className="text-yellow-400" />
            <Input type="email" placeholder="Your Email" className="bg-transparent border-none focus-visible:ring-0 text-white" />
          </div>

          <div className="flex items-start gap-3 bg-[#0f1d33] border border-gray-700 rounded-lg px-4 py-2">
            <MessageSquare className="text-yellow-400 mt-2" />
            <Textarea placeholder="Your Message" className="bg-transparent border-none focus-visible:ring-0 text-white" />
          </div>

          <Button type="submit" size="lg" className="w-full bg-yellow-400 text-black hover:bg-yellow-500 rounded-lg py-6 text-lg shadow-lg">
            Send Message
          </Button>
        </form>

        {/* Social Links */}
        <div className="mt-10 text-center text-gray-400 text-sm">
          <p>Or reach us directly at <span className="text-yellow-400">support@classbuddy.ai</span></p>
        </div>
      </div>
    </div>
  );
}
