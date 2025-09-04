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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      try {
        const imageUrl = URL.createObjectURL(file);
        setFormData((prevData) => ({
          ...prevData,
          imageUrl: imageUrl,
        }));
        setUploadImage(file);
        e.target.value = "";
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupName || !formData.groupDescription) {
      alert("Please fill in all fields and upload an image.");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("group_name", formData.groupName);
    formDataToSend.append("group_des", formData.groupDescription);
    if (uploadImage) formDataToSend.append("image", uploadImage);
    try {
      const response = await axiosClient.post(
        "/insights/create-teacher-insights",
        formDataToSend
      );
      toast.success(response.data.message);
      if (response.status === 200) {
        navigate("/");
        setFormData({
          groupName: "",
          groupDescription: "",
          imageUrl: "",
        });
        setUploadImage(null);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      navigate("/");
    }
  }, [user, navigate]);
  return (
    <div className="flex text-white pt-36 pb-8">
      <div className="flex  justify-center w-full">
        <Card className="w-[600px] mx-auto ">
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
            <div className="grid gap-2">
              <Label>Group Name</Label>
              <Input
                value={formData.groupName}
                onChange={handleInputChange}
                name="groupName"
                placeholder="Enter group name"
              />
            </div>

            <div className="grid gap-2">
              <Label>Group Description</Label>
              <Textarea
                value={formData.groupDescription}
                onChange={handleInputChange}
                name="groupDescription"
                rows={2}
                maxLength={200}
                placeholder="Enter group description"
              />
            </div>

            <div className="grid gap-2">
              <Label>Group Image</Label>
              <Input
                type="file"
                accept="image/*"
                name="imageUrl"
                onChange={handleFileChange}
              />
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
