import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeatureSkeleton() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Heading Skeleton */}
      <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col items-center">
        <Skeleton className="h-12 w-3/4 md:w-1/2 mb-4" />
        <Skeleton className="h-6 w-full md:w-2/3" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-8">
        {[...Array(4)].map((_, index) => (
          <Card
            key={index}
            className="bg-white border border-gray-200 rounded-xl"
          >
            <CardContent className="p-8 text-center flex flex-col items-center">
              {/* Icon Skeleton */}
              <Skeleton className="w-12 h-12 rounded-full mb-6" />
              {/* Title Skeleton */}
              <Skeleton className="h-8 w-48 mb-3" />
              {/* Description Skeleton */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
