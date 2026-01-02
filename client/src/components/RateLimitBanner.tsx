import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppSelector } from "@/hooks/hooks";

export default function RateLimitBanner() {
  const { error } = useAppSelector((state) => state.auth);

  if (!error || !error.includes("Too many requests")) {
    return null;
  }

  return (
    <div className="fixed top-20 left-0 right-0 z-50 px-4 md:px-0 flex justify-center">
      <Alert
        variant="destructive"
        className="max-w-2xl shadow-lg bg-red-50 border-red-200 text-red-800"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Rate Limit Exceeded</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
}
