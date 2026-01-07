import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { axiosClient } from "@/helper/axiosClient";
import { useAppSelector } from "@/hooks/hooks";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function TInsight() {
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    groupName: "",
    groupDescription: "",
    imageUrl: "",
  });

  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  //  Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //  Handle file selection
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
      } catch (error) {
        console.error("Error handling image file:", error);
        toast.error("Failed to process the image. Please try again.");
      }
    }
  };

  // 🔹 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.groupName.trim() || !formData.groupDescription.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!uploadImage) {
      toast.error("Please upload a group image.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("group_name", formData.groupName);
    formDataToSend.append("group_des", formData.groupDescription);
    formDataToSend.append("image", uploadImage);

    try {
      const response = await axiosClient.post(
        "/insights/create-teacher-insights",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message || "Group created successfully!");

      if (response.status === 200) {
        // Reset form after success
        setFormData({
          groupName: "",
          groupDescription: "",
          imageUrl: "",
        });
        setUploadImage(null);
        navigate("/");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Redirect non-teachers away
  useEffect(() => {
    if (!user || user.role !== "teacher") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex text-foreground pt-36 pb-8">
      <div className="flex justify-center w-full">
        <Card className="w-[600px] mx-auto">
          <CardHeader>
            <CardTitle>
              <h1>Create a New Group</h1>
            </CardTitle>
            <CardDescription>
              <p>Fill in the details below to set up your group</p>
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <CardContent className="flex flex-col gap-6">
              {/* Group Name */}
              <div className="grid gap-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  name="groupName"
                  placeholder="Enter group name"
                  required
                />
              </div>

              {/* Group Description */}
              <div className="grid gap-2">
                <Label htmlFor="groupDescription">Group Description</Label>
                <Textarea
                  id="groupDescription"
                  value={formData.groupDescription}
                  onChange={handleInputChange}
                  name="groupDescription"
                  rows={2}
                  maxLength={200}
                  placeholder="Enter group description"
                  required
                />
              </div>

              {/* Group Image */}
              <div className="grid gap-2">
                <Label htmlFor="groupImage">Group Image</Label>
                <Input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  name="imageUrl"
                  onChange={handleFileChange}
                  required
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                )}
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full">
                Create Group
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
