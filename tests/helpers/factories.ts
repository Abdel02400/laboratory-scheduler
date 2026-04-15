import { Equipment } from '@/core/entities/Equipment';
import { Sample } from '@/core/entities/Sample';
import { Technician } from '@/core/entities/Technician';
import type { Equipment as EquipmentDTO } from '@/core/types/models/equipment';
import type { Sample as SampleDTO } from '@/core/types/models/sample';
import type { Technician as TechnicianDTO } from '@/core/types/models/technician';

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
}>;

export function makeSample(overrides: SampleOverride = {}): SampleDTO {
    return {
        id: 'S001',
        priority: 'STAT',
        type: 'BLOOD',
        analysisType: 'Numération complète',
        analysisTime: 45,
        arrivalTime: '08:30',
        patientInfo: { age: 42, service: 'Urgences', diagnosis: 'Suspicion hémorragie' },
        ...overrides,
    } as SampleDTO;
}

export function makeTechnician(overrides: TechnicianOverride = {}): TechnicianDTO {
    return {
        id: 'TECH001',
        name: 'Dr. Test',
        specialty: ['BLOOD'],
        efficiency: 1.0,
        startTime: '08:00',
        endTime: '17:00',
        lunchBreak: '12:00-13:00',
        ...overrides,
    } as TechnicianDTO;
}

export function makeEquipment(overrides: EquipmentOverride = {}): EquipmentDTO {
    return {
        id: 'EQ001',
        name: 'Test Equipment',
        type: 'BLOOD',
        compatibleTypes: ['Numération', 'Hémogramme'],
        capacity: 1,
        maintenanceWindow: '06:00-07:00',
        cleaningTime: 10,
        ...overrides,
    } as EquipmentDTO;
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
