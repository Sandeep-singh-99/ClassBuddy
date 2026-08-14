import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { oauthService } from "@/services/oauthService";
import { useAppDispatch } from "@/hooks/hooks";
import { checkAuth } from "@/redux/slice/authSlice";
import { toast } from "sonner";
import { Loader } from "lucide-react";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React 18 strict mode
    if (processedRef.current) return;
    processedRef.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      toast.error(`Authentication failed: ${errorDescription || error}`);
      navigate("/", { replace: true });
      return;
    }

    if (!code || !state) {
      toast.error("Invalid authorization response parameters");
      navigate("/", { replace: true });
      return;
    }

    const processOAuth = async () => {
      try {
        const user = await oauthService.exchangeAuthorizationCode(code, state);
        await dispatch(checkAuth()).unwrap();

        toast.success("Successfully logged in with ClassBuddy OAuth2!");

        // Navigate based on user role
        if (user.role === "teacher") {
          navigate("/t-dashboard/home", { replace: true });
        } else {
          navigate("/dashboard-panel/home", { replace: true });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "OAuth authentication failed";
        toast.error(message);
        navigate("/", { replace: true });
      }
    };

    processOAuth();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <Loader className="w-12 h-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-semibold">Completing ClassBuddy OAuth Authentication...</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Validating authorization code and securing session...
      </p>
    </div>
  );
}
