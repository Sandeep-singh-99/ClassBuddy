import { Skeleton } from "@/components/ui/skeleton";

export default function PdfSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left Side: Document Overview Skeleton */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-5 border border-border/50 rounded-2xl bg-card space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>

          <div className="p-5 border border-border/50 rounded-2xl bg-card space-y-3 flex-1">
            <Skeleton className="h-4 w-36 rounded mb-4" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Right Side: Chat Window Skeleton */}
        <div className="lg:col-span-8 border border-border/50 rounded-2xl bg-card flex flex-col p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-40 rounded" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>

          <div className="flex-1 space-y-4 py-4 overflow-hidden">
            <div className="flex gap-3 max-w-[80%]">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-3 max-w-[70%] ml-auto flex-row-reverse">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-10 w-full rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-3 max-w-[85%]">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40 space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
