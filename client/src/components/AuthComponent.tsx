import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Mail, Lock, User } from "lucide-react";

export default function AuthComponent() {
  return (
    <Dialog>
      {/* Trigger */}
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-xl px-6 py-2 bg-yellow-400 text-black hover:bg-yellow-500 shadow-md"
        >
          Login
        </Button>
      </DialogTrigger>

      {/* Content */}
      <DialogContent className="sm:max-w-md bg-[#0c1729] border border-gray-700 text-white rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-yellow-400">
            Welcome to ClassBuddy
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-[#111b30] rounded-lg p-1">
            <TabsTrigger
              value="login"
              className="rounded-md data-[state=active]:bg-yellow-400 data-[state=active]:text-black data-[state=inactive]:text-gray-300 hover:data-[state=inactive]:text-white"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-md data-[state=active]:bg-yellow-400 data-[state=active]:text-black data-[state=inactive]:text-gray-300 hover:data-[state=inactive]:text-white"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <form className="space-y-4 mt-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 bg-[#111b30] px-3 rounded-lg border border-gray-700">
                  <Mail className="text-yellow-400" />
                  <Input
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    className="bg-transparent border-0 focus-visible:ring-0 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center gap-2 bg-[#111b30] px-3 rounded-lg border border-gray-700">
                  <Lock className="text-yellow-400" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="bg-transparent border-0 focus-visible:ring-0 text-white"
                    required
                  />
                </div>
              </div>

              <DialogFooter className="flex justify-between mt-6">
                <DialogClose asChild>
                  <Button variant="secondary" className="rounded-lg">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-lg px-6"
                >
                  Log In
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* SIGNUP */}
          <TabsContent value="signup">
            <form className="space-y-4 mt-6">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center transition hover:bg-[#111b30]"
                >
                  <User className="text-gray-400 w-10 h-10" />
                </label>
                <input
                  type="file"
                  id="fileInput"
                  name="imageUrl"
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="fullName">FullName</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                  <Input
                    id="fullName"
                    placeholder="Enter your Full Name"
                    className="pl-10 bg-[#111b30] border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-[#111b30] border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 bg-[#111b30] border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <DialogFooter className="flex justify-between mt-6">
                <DialogClose asChild>
                  <Button variant="secondary" className="rounded-lg">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-lg px-6"
                >
                  Sign Up
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
