export const METADATA_LABELS = {
    PRIORITY_MANAGEMENT: 'priority_management',
    SPECIALIZATION_MATCHING: 'specialization_matching',
    EQUIPMENT_COMPATIBILITY: 'equipment_compatibility',
    PARALLELISM_OPTIMIZATION: 'parallelism_optimization',
    LUNCH_BREAKS: 'lunch_breaks',
    MAINTENANCE_AVOIDANCE: 'maintenance_avoidance',
    CLEANING_DELAYS: 'cleaning_delays',
    EFFICIENCY_COEFFICIENTS: 'efficiency_coefficients',
} as const;

export type MetadataLabel = (typeof METADATA_LABELS)[keyof typeof METADATA_LABELS];
