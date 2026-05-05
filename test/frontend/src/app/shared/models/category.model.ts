export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  type?: 'income' | 'expense';
  icon?: string;
  color?: string;
}