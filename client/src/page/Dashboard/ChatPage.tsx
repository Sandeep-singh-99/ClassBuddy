import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      {/* Chat messages area */}
      {/* <div className="flex-1 w-full max-w-5xl overflow-y-auto p-4">  
      </div> */}

      <div className="flex-1 w-full max-w-5xl overflow-y-auto p-4 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center shadow-sm hover:border-blue-500 hover:bg-gray-100 transition">
          <p className="text-gray-600 text-lg font-medium mb-2">
            📄 Upload a PDF to start chatting
          </p>
          <p className="text-gray-500 text-sm">
            Once uploaded, you can ask questions and get instant answers from
            your document.
          </p>
        </div>
      </div>

      {/* Floating Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-transparent">
        <Card className="w-full max-w-5xl shadow-lg">
          <CardContent className="flex flex-row gap-4 items-center">
            {/* File Upload */}
            <label htmlFor="file-upload">
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={() => {}}
              />
              <Button variant="outline" size="icon" asChild>
                <span>
                  <Paperclip />
                </span>
              </Button>
            </label>

            {/* Message Input */}
            <Input placeholder="Type your message..." className="flex-1" />

            {/* Send Button */}
            <Button size="icon">
              <Send />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
