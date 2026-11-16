import { useEffect, useState } from "react";
import { loadRazorpay } from "@/helper/loadRazorPay";
import { Button } from "./ui/button";
import { createOrder } from "@/services/payment";
import { axiosClient } from "@/helper/axiosClient";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchStudentSubscriptionPlans } from "@/redux/slice/subscriptionSlice";
import { toast } from "sonner";
import { Loader2, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  plan_id: string;
  planName: string;
  className?: string;
  variant?: "default" | "secondary" | "outline";
  buttonText?: string;
  isPopular?: boolean;
  disabled?: boolean;
  onSuccess?: () => void;
};

export default function BuyPlanButton({
  plan_id,
  planName,
  className,
  variant = "default",
  buttonText,
  disabled = false,
  onSuccess,
}: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);

  // Check if student already has an active subscription for this group/plan
  const isAlreadySubscribed = useAppSelector((state) => {
    return state.subscription.studentGroups.some((groupItem) => {
      if (!groupItem.subscription?.is_active) return false;
      const validTill = new Date(groupItem.subscription.valid_till);
      if (validTill.getTime() <= Date.now()) return false;
      return groupItem.plans.some((p) => p.id === plan_id);
    });
  });

  const isSubscribedOrVerified = isPaymentVerified || isAlreadySubscribed;
  const isButtonDisabled = disabled || loading || isSubscribedOrVerified;

  useEffect(() => {
    loadRazorpay();
  }, []);

  const handlePayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loadRazorpay();

      if (!response) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const order = await createOrder(plan_id);

      // Open Razorpay checkout modal
      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "ClassBuddy",
        description: planName,
        order_id: order.order_id,

        handler: async function (response: any) {
          try {
            // Verify payment on backend
            await axiosClient.post("/subscription/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: plan_id,
            });

            toast.success("Payment successful! Access granted 🎉");
            setIsPaymentVerified(true);
            await dispatch(fetchStudentSubscriptionPlans());
            onSuccess?.();
          } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },

        prefill: {
          name: user?.full_name,
          email: user?.email,
        },

        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isButtonDisabled}
      variant={variant}
      className={cn(
        "group relative w-full h-11 rounded-xl font-semibold transition-all duration-300 shadow-sm",
        isSubscribedOrVerified
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-not-allowed hover:bg-emerald-500/15 shadow-none"
          : "active:scale-[0.99] cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md",
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-current" />
          <span>Opening Checkout...</span>
        </span>
      ) : isSubscribedOrVerified ? (
        <span className="flex items-center justify-center gap-2 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Active Subscription</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>{buttonText || "Subscribe Now"}</span>
          <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-1" />
        </span>
      )}
    </Button>
  );
}
