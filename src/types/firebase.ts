// Firebase Timestamp interface
export interface FirestoreTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

// Type guard for Firestore Timestamp
export function isFirestoreTimestamp(value: unknown): value is FirestoreTimestamp {
  return (
    value !== null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as Record<string, unknown>).toDate === 'function'
  );
}

// Helper function to convert various date formats to Date
export function convertToDate(dateValue: unknown): Date {
  if (!dateValue) {
    return new Date();
  }
  
  // Handle Firestore Timestamp
  if (isFirestoreTimestamp(dateValue)) {
    return dateValue.toDate();
  }
  
  // Handle regular Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Handle string or number dates
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  // Fallback to current date
  return new Date();
}