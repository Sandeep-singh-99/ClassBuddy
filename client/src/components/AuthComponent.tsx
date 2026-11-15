import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Mail, Lock, User, UserCog, Loader } from "lucide-react";
import { useAppDispatch } from "@/hooks/hooks";
import { login, register } from "@/redux/slice/authSlice";
import { toast } from "sonner";

interface IFormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  imageUrl: string;
}

interface AuthComponentProps {
  trigger?: React.ReactNode;
  defaultTab?: "login" | "signup";
}

export default function AuthComponent({ trigger, defaultTab = "login" }: AuthComponentProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<IFormData>({
    fullName: "",
    email: "",
    password: "",
    role: "",
    imageUrl: "",
  });

  const dispatch = useAppDispatch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      try {
        const imageUrl = URL.createObjectURL(file);
        setFormData((prevData) => ({
          ...prevData,
          imageUrl,
        }));
        setUploadImage(file);
        e.target.value = "";
      } catch (error) {
        console.error("Error creating object URL:", error);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    setLoading(true);

    try {
      const response = await dispatch(login({ email, password })).unwrap();
      if (response?.redirect_url) {
        window.location.href = response.redirect_url;
      }
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "string" ? error : "Invalid Credentials";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadImage) {
      setLoading(false);
      toast.error("Please upload a profile image");
      return;
    }

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setLoading(false);
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("full_name", formData.fullName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("image", uploadImage);

    try {
      await dispatch(register(formDataToSend)).unwrap();
      toast.success("Registration successful! Starting OAuth login...");
      const response = await dispatch(
        login({ email: formData.email, password: formData.password })
      ).unwrap();
      if (response?.redirect_url) {
        window.location.href = response.redirect_url;
      }
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "string" ? error : "Registration failed";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Dialog>
      {/* Trigger */}
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="default"
            className="rounded-xl px-5 py-2 font-semibold bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            Log In / Sign Up
          </Button>
        )}
      </DialogTrigger>

      {/* Content */}
      <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            Welcome to ClassBuddy
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Please log in to your account or create a new student or educator account.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted rounded-lg p-1">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <form className="space-y-4 mt-6" onSubmit={handleLoginSubmit}>
              <div className="grid gap-2 w-full">
                <Label htmlFor="login_email" className="text-foreground">
                  Email ID
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    id="login_email"
                    type="email"
                    placeholder="Enter your Email ID"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="login_password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    id="login_password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-primary focus:ring-primary"
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
                <Button type="submit" disabled={loading}>
                  {loading && <Loader className="animate-spin mr-2" />}
                  Log In
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* SIGNUP */}
          <TabsContent value="signup">
            <form className="space-y-3 mt-6" onSubmit={handleSignUpSubmit}>
              {/* Avatar Upload */}

              <div className="flex justify-center">
                <input
                  type="file"
                  id="fileInput"
                  name="imageUrl"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center transition duration-300 ease-in-out hover:bg-gray-100"
                  aria-label="Upload Image"
                >
                  {uploadImage ? (
                    <img
                      src={formData.imageUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-muted-foreground text-center">
                      Upload Image
                    </span>
                  )}
                </label>
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="fullName" className="text-foreground">
                  FullName
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    id="fullName"
                    placeholder="Enter your Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="signup_email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                  <Input
                    id="signup_email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-primary focus:ring-primary"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role" className="text-foreground">
                  Role
                </Label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                  <Select
                    value={formData.role}
                    onValueChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e }))
                    }
                  >
                    <SelectTrigger className="w-full pl-10 bg-background border-input rounded-lg text-foreground focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Select a Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground">
                          Roles
                        </SelectLabel>
                        <SelectItem
                          value="student"
                          className="text-foreground focus:bg-accent"
                        >
                          Student
                        </SelectItem>
                        <SelectItem
                          value="teacher"
                          className="text-foreground focus:bg-accent"
                        >
                          Teacher
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="signup_password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                  <Input
                    id="signup_password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-primary focus:ring-primary"
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
                <Button type="submit" disabled={loading}>
                  {loading && <Loader className="animate-spin mr-2" />}
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
