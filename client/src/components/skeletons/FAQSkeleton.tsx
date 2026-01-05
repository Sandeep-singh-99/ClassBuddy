import { Skeleton } from "@/components/ui/skeleton";

export default function FAQSkeleton() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Heading Skeleton */}
        <div className="flex flex-col items-center mb-12">
          <Skeleton className="h-10 w-2/3 md:w-1/2 mb-4" />
          <Skeleton className="h-5 w-full md:w-3/4" />
        </div>

        {/* FAQ Items Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="border border-gray-200 bg-white rounded-xl overflow-hidden p-4 flex justify-between items-center"
            >
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
