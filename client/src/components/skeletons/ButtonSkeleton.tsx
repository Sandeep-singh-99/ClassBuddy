import { Skeleton } from "@/components/ui/skeleton"

interface ButtonSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export default function ButtonSkeleton({
  className = "",
  width = "w-24",
  height = "h-10",
}: ButtonSkeletonProps) {
  return (
    <Skeleton className={`${width} ${height} rounded-lg ${className}`} />
  )
}
