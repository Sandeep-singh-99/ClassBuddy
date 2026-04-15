import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function QuizCardSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <CardDescription className="flex justify-between w-full mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
