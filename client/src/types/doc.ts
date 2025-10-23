export interface IOwner {
  id: string;
  full_name: string;
  email: string;
  role: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface IDocs {
  id: string;
  filename: string;
  file_url: string;
  owner: IOwner;
  created_at: string;
  updated_at: string;
}