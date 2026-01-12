export interface ISubscription {
  id: string;
  group_id: string;
  plan_id: string;
  amount: number;
  valid_till: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
}

export interface IPlan {
  id: string;
  group_id: string;
  group_name?: string;
  plan_name: string;
  amount: number;
  validity_days: number;
  created_at: string;
}

export interface ICreatePlan {
  plan_name: string;
  amount: number;
  validity_days: number;
}

export interface IStudentGroupSubscription {
  teacher: {
    id: string;
    name: string;
    email: string;
    image_url?: string;
  };
  group: {
    id: string;
    name: string;
    description: string;
    image_url?: string;
  };
  plans: IPlan[];
}
