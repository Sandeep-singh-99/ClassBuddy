import { loadRazorpay } from "@/helper/loadRazorPay";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { createOrder } from "@/services/payment";
import { axiosClient } from "@/helper/axiosClient";
import { useAppSelector } from "@/hooks/hooks";

type Props = {
  plan_id: string;
  planName: string;
};

export default function BuyPlanButton({ plan_id, planName }: Props) {
  const { user } = useAppSelector((state) => state.auth);

  const handlePayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    const response = await loadRazorpay();

    if (!response) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const order = await createOrder(plan_id);

    // open checkout
    const options = {
      key: order.key,
      amount: order.amount,
      currency: "INR",
      name: "ClassBuddy",
      description: planName,
      order_id: order.order_id,

      handler: async function (response: any) {
        // verify payment backend
        await axiosClient.post("/subscription/verify-payment", {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          plan_id: plan_id,
        });

        toast.success("Payment successful 🎉");
      },

      prefill: {
        name: user?.full_name,
        email: user?.email,
      },

      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };


  return (
    <Button
      onClick={handlePayment}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      Subscribe Now
    </Button>
  );
}
