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

export default function TInsight() {
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

          <CardContent className="flex flex-col gap-6">
           <div className="grid gap-2">
            <Label>
              Group Name
            </Label>
            <Input placeholder="Enter group name" />
           </div>

           <div className="grid gap-2">
            <Label>
              Group Description
            </Label>
            <Textarea rows={2} maxLength={200} placeholder="Enter group description" />
           </div>

           <div className="grid gap-2">
            <Label>
              Group Image
            </Label>
            <Input type="file" accept="image/*" />
           </div>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Create Group
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
