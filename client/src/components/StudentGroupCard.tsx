import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen } from "lucide-react";
import type { IStudentGroupSubscription } from "@/types/subscription";
import { SubscriptionPlansDialog } from "./SubscriptionPlansDialog";

interface StudentGroupCardProps {
  data: IStudentGroupSubscription;
}

export function StudentGroupCard({ data }: StudentGroupCardProps) {
  const { group, teacher, plans } = data;

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-zinc-200 dark:border-zinc-800">
      {/* Image Section */}
      <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
        {group.image_url ? (
          <img
            src={group.image_url}
            alt={group.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-indigo-300 dark:text-indigo-900/40">
            <BookOpen className="h-16 w-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm font-medium">{teacher.name}</p>
        </div>
      </div>

      <CardHeader className="">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold line-clamp-1 text-zinc-900 dark:text-zinc-50">
            {group.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-grow ">
        {/* Simple clean teacher row */}
        <div className="flex items-center space-x-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700">
            <AvatarImage src={teacher.image_url} alt={teacher.name} />
            <AvatarFallback className="text-xs">
              {teacher.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-zinc-900 dark:text-zinc-200">
              {teacher.name}
            </span>
            <span className="text-xs truncate max-w-[180px]">
              {teacher.email}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-2 px-6">
        <SubscriptionPlansDialog plans={plans} groupName={group.name} />
      </CardFooter>
    </Card>
  );
}
