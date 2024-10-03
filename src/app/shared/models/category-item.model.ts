export interface ICategoryItem {
  id?: string;
  object?: string;
  element?: string;
  background?: string;
  title?: string;
  subtitle?: string;
  tags?: string[];
  JSON?: string;
  rating?: {user: string; value: number}[];
  content?: string;
  cover?: string;
}
