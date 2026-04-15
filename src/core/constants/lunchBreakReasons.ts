export const LUNCH_BREAK_REASONS = {
    ADJUSTED_FOR_OPTIMIZATION: 'adjusted for optimization',
} as const;

export type LunchBreakReason = (typeof LUNCH_BREAK_REASONS)[keyof typeof LUNCH_BREAK_REASONS];
