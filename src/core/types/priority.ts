export const PRIORITY = {
  STAT: "STAT",
  URGENT: "URGENT",
  ROUTINE: "ROUTINE",
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

export const PRIORITIES = Object.values(PRIORITY) as readonly Priority[];