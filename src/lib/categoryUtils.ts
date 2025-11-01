import { CategoryData } from '../types/blog';

// Validation functions
export const validateCategoryName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Category name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Category name must be at least 2 characters long' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Category name must be less than 50 characters' };
  }
  
  return { isValid: true };
};

export const validateCategoryDescription = (description?: string): { isValid: boolean; error?: string } => {
  if (description && description.length > 200) {
    return { isValid: false, error: 'Category description must be less than 200 characters' };
  }
  
  return { isValid: true };
};

// Slug generation for categories
export const generateCategorySlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Validate complete category data
export const validateCategoryData = (categoryData: Partial<Omit<CategoryData, 'id' | 'createdAt' | 'blogCount'>>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!categoryData.name) {
    errors.push('Category name is required');
  } else {
    const nameValidation = validateCategoryName(categoryData.name);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.error!);
    }
  }
  
  if (categoryData.description) {
    const descriptionValidation = validateCategoryDescription(categoryData.description);
    if (!descriptionValidation.isValid) {
      errors.push(descriptionValidation.error!);
    }
  }
  
  // Validate color format if provided (should be hex color)
  if (categoryData.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(categoryData.color)) {
    errors.push('Color must be a valid hex color (e.g., #FF0000 or #F00)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form data to category data conversion
export const formDataToCategoryData = (formData: {
  name: string;
  description?: string;
  color?: string;
}): Omit<CategoryData, 'id' | 'createdAt' | 'blogCount'> => {
  const slug = generateCategorySlug(formData.name);
  
  return {
    name: formData.name.trim(),
    slug,
    description: formData.description?.trim(),
    color: formData.color
  };
};