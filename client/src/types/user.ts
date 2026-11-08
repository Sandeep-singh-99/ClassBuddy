export interface IUser {
  id: string;
  sub?: string;
  name?: string;
  full_name: string;
  email: string;
  image_url: string;
  imageUrlId?: string;
  role: string;
  password?: string;
}
