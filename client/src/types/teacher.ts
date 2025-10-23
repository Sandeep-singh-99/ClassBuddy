export interface IOwner {
  id: string;
  full_name: string;
  email: string;
  role: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface IMember {
  id: string;
  full_name: string;
  email: string;
  image_url: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface TViewAllState {
  id: string;
  group_name: string;
  group_des: string;
  image_url: string;
  owner: IOwner;
  members: IMember[];
  students_count: number;
  created_at?: string;
  updated_at?: string;
}
