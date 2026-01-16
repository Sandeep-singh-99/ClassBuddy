export interface ISubscription {
  id: string;
  group_id: string;
  plan_id: string;
  amount: number;
  start_date: string;
  valid_till: string;
  is_active: boolean;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  created_at: string;
  updated_at: string;
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
  subscription: ISubscription | null;
}


export interface ITeacherSubscriptionStats {
  paid_students: number;
  total_students: number;
  total_earnings: number;
}