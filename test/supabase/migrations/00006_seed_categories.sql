-- Seed default categories for new users
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Income categories
  INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
    (p_user_id, 'Salary',        'income', 'income',  '#2ECC71', TRUE),
    (p_user_id, 'Freelance',     'income', 'income',  '#27AE60', TRUE),
    (p_user_id, 'Investments',   'income', 'income',  '#1ABC9C', TRUE),
    (p_user_id, 'Other Income',  'income', 'income',  '#16A085', TRUE);

  -- Expense categories
  INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
    (p_user_id, 'Rent/Mortgage',   'expense', 'home',     '#E74C3C', TRUE),
    (p_user_id, 'Groceries',       'expense', 'cart',     '#E67E22', TRUE),
    (p_user_id, 'Fuel/Transport',  'expense', 'fuel',    '#F39C12', TRUE),
    (p_user_id, 'Utilities',       'expense', 'bolt',     '#9B59B6', TRUE),
    (p_user_id, 'Entertainment',   'expense', 'film',     '#3498DB', TRUE),
    (p_user_id, 'Healthcare',      'expense', 'heart',   '#E91E63', TRUE),
    (p_user_id, 'Insurance',       'expense', 'shield',  '#607D8B', TRUE),
    (p_user_id, 'Subscriptions',  'expense', 'repeat',  '#FF9800', TRUE),
    (p_user_id, 'Miscellaneous',   'expense', 'tag',     '#795548', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the new-user trigger to also seed categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  PERFORM public.seed_default_categories(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;