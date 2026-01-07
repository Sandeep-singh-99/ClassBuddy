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
import { AxiosError } from "axios";
import { useAppDispatch } from "@/hooks/hooks";
import { checkAuth, login, register } from "@/redux/slice/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface IFormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  imageUrl: string;
}

export default function AuthComponent() {
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
  const navigate = useNavigate();

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

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    try {
      const response = await dispatch(login(formData)).unwrap();
      toast.success(response.message);
      dispatch(checkAuth());
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ detail: string }>;
      const errorMessage =
        axiosError.response?.data?.detail || "Invalid Credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadImage) {
      setLoading(false);
      console.error("No image uploaded");
      return;
    }

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setLoading(false);
      console.error("Please fill in all fields");
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
      toast.success("Registration successful");
      navigate("/t-insights");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ detail: string }>;
      const errorMessage =
        axiosError.response?.data?.detail || "Invalid Credentials";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog>
      {/* Trigger */}
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-xl px-6 py-2 bg-yellow-500 text-white hover:bg-yellow-600 shadow-md cursor-pointer"
        >
          Login
        </Button>
      </DialogTrigger>

      {/* Content */}
      <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-yellow-500">
            Welcome to ClassBuddy
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Please log in to your account or sign up to get started.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted rounded-lg p-1">
            <TabsTrigger
              value="login"
              className="rounded-md data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-md data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <form className="space-y-4 mt-6" onSubmit={handleLoginSubmit}>
              <div className="grid gap-2 w-full">
                <Label htmlFor="email" className="text-foreground">
                  Email ID
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                  <Input
                    id="email"
                    placeholder="Enter your Email ID"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-yellow-500 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-yellow-500 focus:ring-yellow-500"
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
                  disabled={loading}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg px-6"
                >
                  {loading && <Loader className="animate-spin text-blue-900" />}
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
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                  <Input
                    id="fullName"
                    placeholder="Enter your Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-yellow-500 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-yellow-500 focus:ring-yellow-500"
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
                  <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 w-5 h-5" />
                  <Select
                    value={formData.role}
                    onValueChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e }))
                    }
                  >
                    <SelectTrigger className="w-full pl-10 bg-background border-input rounded-lg text-foreground focus:border-yellow-500 focus:ring-yellow-500">
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
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 bg-background border-input rounded-lg text-foreground focus:border-yellow-500 focus:ring-yellow-500"
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
                  disabled={loading}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg px-6"
                >
                  {loading && <Loader className="animate-spin text-blue-900" />}
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
