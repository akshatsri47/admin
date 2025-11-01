import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  Timestamp,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { BlogData, CategoryData, BlogFilters, BlogListResponse } from '../types/blog';

// Collection references
export const COLLECTIONS = {
  BLOGS: 'blogs',
  CATEGORIES: 'blog_categories',
  TAGS: 'blog_tags'
} as const;

// Helper function to remove undefined values from objects
const cleanUndefinedValues = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues);
  }
  
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
};

// Blog CRUD operations
export const createBlog = async (blogData: Omit<BlogData, 'id'>): Promise<string> => {
  try {
    // Clean undefined values before sending to Firestore
    const cleanedData = cleanUndefinedValues({
      ...blogData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }) as Record<string, unknown>;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docRef = await addDoc(collection(db, COLLECTIONS.BLOGS), cleanedData as any);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw new Error('Failed to create blog');
  }
};

export const updateBlog = async (blogId: string, blogData: Partial<BlogData>): Promise<void> => {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, blogId);
    
    // Clean undefined values before sending to Firestore
    const cleanedData = cleanUndefinedValues({
      ...blogData,
      updatedAt: Timestamp.now()
    }) as Record<string, unknown>;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(blogRef, cleanedData as any);
  } catch (error) {
    console.error('Error updating blog:', error);
    throw new Error('Failed to update blog');
  }
};

export const deleteBlog = async (blogId: string): Promise<void> => {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, blogId);
    await deleteDoc(blogRef);
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw new Error('Failed to delete blog');
  }
};

export const getBlogById = async (blogId: string): Promise<BlogData | null> => {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, blogId);
    const blogSnap = await getDoc(blogRef);
    
    if (blogSnap.exists()) {
      return { id: blogSnap.id, ...blogSnap.data() } as BlogData;
    }
    return null;
  } catch (error) {
    console.error('Error getting blog:', error);
    throw new Error('Failed to get blog');
  }
};

export const getBlogBySlug = async (slug: string): Promise<BlogData | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.BLOGS),
      where('slug', '==', slug),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as BlogData;
    }
    return null;
  } catch (error) {
    console.error('Error getting blog by slug:', error);
    throw new Error('Failed to get blog');
  }
};

export const getBlogs = async (
  filters: BlogFilters = {},
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<BlogListResponse> => {
  try {
    const constraints: QueryConstraint[] = [];
    
    // Note: We avoid adding status filter here to prevent composite index requirement
    // Status filtering will be done client-side below
    
    if (filters.category) {
      constraints.push(where('categories', 'array-contains', filters.category));
    }
    
    if (filters.tags && filters.tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', filters.tags));
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        constraints.push(where('publishDate', '>=', Timestamp.fromDate(filters.dateRange.start)));
      }
      if (filters.dateRange.end) {
        constraints.push(where('publishDate', '<=', Timestamp.fromDate(filters.dateRange.end)));
      }
    }
    
    // Add ordering and pagination
    constraints.push(orderBy('publishDate', 'desc'));
    // Get more documents to account for client-side filtering
    const fetchSize = filters.status ? pageSize * 3 : pageSize + 1;
    constraints.push(limit(fetchSize));
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    const q = query(collection(db, COLLECTIONS.BLOGS), ...constraints);
    const querySnapshot = await getDocs(q);
    
    let allBlogs: BlogData[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogData[];
    
    // Client-side filtering for status to avoid composite index requirement
    if (filters.status) {
      allBlogs = allBlogs.filter(blog => blog.status === filters.status);
    }
    
    // Take only the requested page size
    const blogs = allBlogs.slice(0, pageSize);
    const hasMore = allBlogs.length > pageSize;
    const nextCursor = hasMore ? blogs[pageSize - 1]?.id : undefined;
    
    return {
      blogs,
      totalCount: blogs.length, // Note: This is not the total count, just current page count
      hasMore,
      nextCursor
    };
  } catch (error) {
    console.error('Error getting blogs:', error);
    throw new Error('Failed to get blogs');
  }
};

// Category CRUD operations
export const createCategory = async (categoryData: Omit<CategoryData, 'id' | 'createdAt'>): Promise<string> => {
  try {
    // Clean undefined values before sending to Firestore
    const cleanedData = cleanUndefinedValues({
      ...categoryData,
      createdAt: Timestamp.now()
    }) as Record<string, unknown>;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), cleanedData as any);
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }
};

export const updateCategory = async (categoryId: string, categoryData: Partial<CategoryData>): Promise<void> => {
  try {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    
    // Clean undefined values before sending to Firestore
    const cleanedData = cleanUndefinedValues(categoryData) as Record<string, unknown>;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(categoryRef, cleanedData as any);
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
};

export const getCategoryById = async (categoryId: string): Promise<CategoryData | null> => {
  try {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (categorySnap.exists()) {
      return { id: categorySnap.id, ...categorySnap.data() } as CategoryData;
    }
    return null;
  } catch (error) {
    console.error('Error getting category:', error);
    throw new Error('Failed to get category');
  }
};

export const getCategories = async (): Promise<CategoryData[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CategoryData[];
  } catch (error) {
    console.error('Error getting categories:', error);
    throw new Error('Failed to get categories');
  }
};

export const checkCategorySlugExists = async (slug: string, excludeCategoryId?: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CATEGORIES),
      where('slug', '==', slug)
    );
    const querySnapshot = await getDocs(q);
    
    if (excludeCategoryId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeCategoryId);
    }
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking category slug:', error);
    return false;
  }
};

// Utility functions
export const incrementBlogViews = async (blogId: string): Promise<void> => {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, blogId);
    const blogSnap = await getDoc(blogRef);
    
    if (blogSnap.exists()) {
      const currentViews = blogSnap.data().analytics?.views || 0;
      await updateDoc(blogRef, {
        'analytics.views': currentViews + 1,
        'analytics.lastViewed': Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error incrementing blog views:', error);
    // Don't throw error for analytics - it's not critical
  }
};

export const checkSlugExists = async (slug: string, excludeBlogId?: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.BLOGS),
      where('slug', '==', slug)
    );
    const querySnapshot = await getDocs(q);
    
    if (excludeBlogId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeBlogId);
    }
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking slug:', error);
    return false;
  }
};