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
import { Mail, Lock, User, UserCog } from "lucide-react";
import { AxiosError } from "axios";
import { useAppDispatch } from "@/hooks/hooks";
import { checkAuth, login, register } from "@/redux/slice/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";

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
          <DialogDescription className="text-center text-gray-300">
            Please log in to your account or sign up to get started.
           {
            loading && <BarLoader width={"100%"} color="gray" className="my-4" />
           }
          </DialogDescription>
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
            <form className="space-y-4 mt-6" onSubmit={handleLoginSubmit}>
              <div className="grid gap-2 w-full">
                <Label htmlFor="email">Email ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                  <Input
                    id="email"
                    placeholder="Enter your Email ID"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#111b30] border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  disabled={loading}
                  className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-lg px-6"
                >
                  {loading ? "Loading..." : "Log In"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* SIGNUP */}
          <TabsContent value="signup">
            <form className="space-y-4 mt-6" onSubmit={handleSignUpSubmit}>
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
                    <span className="text-gray-400 text-center">
                      Upload Image
                    </span>
                  )}
                </label>
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="fullName">FullName</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                  <Input
                    id="fullName"
                    placeholder="Enter your Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
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
                    name="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-[#111b30] border-gray-700 rounded-lg text-white"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 w-5 h-5" />
                  <Select
                    value={formData.role}
                    onValueChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e }))
                    }
                  >
                    <SelectTrigger className="w-full pl-10 bg-[#111b30] border-gray-700 rounded-lg text-white">
                      <SelectValue placeholder="Select a Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
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
                  disabled={loading}
                  className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-lg px-6"
                >
                  {loading ? "Loading..." : "Sign Up"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
