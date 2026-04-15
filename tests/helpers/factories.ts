import { Constraints } from '@/core/entities/Constraints';
import { Equipment } from '@/core/entities/Equipment';
import { Laboratory } from '@/core/entities/Laboratory';
import { Sample } from '@/core/entities/Sample';
import { Technician } from '@/core/entities/Technician';
import type { ConstraintsInput } from '@/core/types/inputs/constraints';
import type { EquipmentInput } from '@/core/types/inputs/equipment';
import type { LaboratoryInput } from '@/core/types/inputs/laboratory';
import type { SampleInput } from '@/core/types/inputs/sample';
import type { TechnicianInput } from '@/core/types/inputs/technician';

type SampleOverride = Partial<{
    id: string;
    priority: 'STAT' | 'URGENT' | 'ROUTINE';
    type: 'BLOOD' | 'URINE' | 'TISSUE';
    analysisType: string;
    analysisTime: number;
    arrivalTime: string;
    patientInfo: { age: number; service: string; diagnosis: string };
}>;

type TechnicianOverride = Partial<{
    id: string;
    name: string;
    specialty: Array<'BLOOD' | 'CHEMISTRY' | 'MICROBIOLOGY' | 'IMMUNOLOGY' | 'GENETICS'>;
    speciality: 'BLOOD' | 'CHEMISTRY' | 'MICROBIOLOGY' | 'IMMUNOLOGY' | 'GENETICS';
    efficiency: number;
    startTime: string;
    endTime: string;
    lunchBreak: string;
}>;

type EquipmentOverride = Partial<{
    id: string;
    name: string;
    type: 'BLOOD' | 'CHEMISTRY' | 'MICROBIOLOGY' | 'IMMUNOLOGY' | 'GENETICS';
    compatibleTypes: string[];
    capacity: number;
    maintenanceWindow: string;
    cleaningTime: number;
    available: boolean;
}>;

type LaboratoryOverride = Partial<{
    name: string;
    openingHours: string;
    date: string;
}>;

type ConstraintsOverride = Partial<{
    maxProcessingTime: number;
    priorityRules: Array<'STAT' | 'URGENT' | 'ROUTINE'>;
    contaminationPrevention: boolean;
    parallelProcessing: boolean;
}>;

export function makeSample(overrides: SampleOverride = {}): SampleInput {
    return {
        id: 'S001',
        priority: 'STAT',
        type: 'BLOOD',
        analysisType: 'Numération complète',
        analysisTime: 45,
        arrivalTime: '08:30',
        patientInfo: { age: 42, service: 'Urgences', diagnosis: 'Suspicion hémorragie' },
        ...overrides,
    } as SampleInput;
}

export function makeTechnician(overrides: TechnicianOverride = {}): TechnicianInput {
    return {
        id: 'TECH001',
        name: 'Dr. Test',
        specialty: ['BLOOD'],
        efficiency: 1.0,
        startTime: '08:00',
        endTime: '17:00',
        lunchBreak: '12:00-13:00',
        ...overrides,
    } as TechnicianInput;
}

export function makeEquipment(overrides: EquipmentOverride = {}): EquipmentInput {
    return {
        id: 'EQ001',
        name: 'Test Equipment',
        type: 'BLOOD',
        compatibleTypes: ['Numération', 'Hémogramme'],
        capacity: 1,
        maintenanceWindow: '06:00-07:00',
        cleaningTime: 10,
        ...overrides,
    } as EquipmentInput;
}

export function makeLaboratory(overrides: LaboratoryOverride = {}): LaboratoryInput {
    return {
        name: 'Test Lab',
        openingHours: '07:00-18:00',
        date: '2025-03-15',
        ...overrides,
    };
}

export function makeConstraints(overrides: ConstraintsOverride = {}): ConstraintsInput {
    return {
        maxProcessingTime: 480,
        priorityRules: ['STAT', 'URGENT', 'ROUTINE'],
        contaminationPrevention: true,
        parallelProcessing: true,
        ...overrides,
    } as ConstraintsInput;
}

export function makeSampleEntity(overrides: SampleOverride = {}): Sample {
    return new Sample(makeSample(overrides));
}

export function makeTechnicianEntity(overrides: TechnicianOverride = {}): Technician {
    return new Technician(makeTechnician(overrides));
}

export function makeEquipmentEntity(overrides: EquipmentOverride = {}): Equipment {
    return new Equipment(makeEquipment(overrides));
}

export function makeLaboratoryEntity(overrides: LaboratoryOverride = {}): Laboratory {
    return new Laboratory(makeLaboratory(overrides));
}

export function makeConstraintsEntity(overrides: ConstraintsOverride = {}): Constraints {
    return new Constraints(makeConstraints(overrides));
}
