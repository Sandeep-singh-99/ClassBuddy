import { loadRazorpay } from "@/helper/loadRazorPay";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { createOrder } from "@/services/payment";

type Props = {
  plan_id: string;
  amount: number;
  planName: string;
};

export default function BuyPlanButton({ plan_id, amount, planName }: Props) {
  const handlePayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    const response = await loadRazorpay();

    if (!response) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const order = await createOrder(plan_id);

    // 2️⃣ open checkout
    const options = {
      key: order.key, // public key
      amount: order.amount,
      currency: "INR",
      name: "ClassBuddy",
      description: planName,
      order_id: order.order_id,

      handler: async function (response: any) {
        // 3️⃣ verify payment backend
        await fetch("/subscription/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            plan_id: plan_id,
          }),
        });

        toast.success("Payment successful 🎉");
      },

      prefill: {
        name: "Akash Yadav",
        email: "akash@gmail.com",
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
