import { useEffect, useState } from "react";
import { loadRazorpay } from "@/helper/loadRazorPay";
import { Button } from "./ui/button";
import { createOrder } from "@/services/payment";
import { axiosClient } from "@/helper/axiosClient";
import { useAppSelector } from "@/hooks/hooks";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

type Props = {
  plan_id: string;
  planName: string;
};

export default function BuyPlanButton({ plan_id, planName }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

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
            window.location.reload();
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
      disabled={loading}
      className="w-full rounded-xl gap-2 font-semibold shadow-md bg-primary text-primary-foreground hover:opacity-95 transition-all duration-300"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Processing Payment...
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4" /> Subscribe Now
        </>
      )}
    </Button>
  );
}
