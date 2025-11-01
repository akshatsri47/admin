// Type declaration for d3-time to resolve TypeScript errors
declare module 'd3-time' {
  export interface TimeInterval {
    (date: Date): Date;
    floor(date: Date): Date;
    round(date: Date): Date;
    ceil(date: Date): Date;
    offset(date: Date, step?: number): Date;
    range(start: Date, stop: Date, step?: number): Date[];
    filter(test: (date: Date) => boolean): TimeInterval;
  }

  export const timeMillisecond: TimeInterval;
  export const timeSecond: TimeInterval;
  export const timeMinute: TimeInterval;
  export const timeHour: TimeInterval;
  export const timeDay: TimeInterval;
  export const timeWeek: TimeInterval;
  export const timeMonth: TimeInterval;
  export const timeYear: TimeInterval;
}