export interface IOwner {
  id: string;
  full_name: string;
  email: string;
  role: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface IQuestion {
  id: string;
  type: string;
  question_text: string;
  question: string;
}

export interface IAssignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  owner: IOwner;
  created_at: string;
  updated_at: string;
  questions: IQuestion[];
}