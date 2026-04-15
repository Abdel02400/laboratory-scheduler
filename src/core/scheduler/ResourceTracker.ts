import type { Constraints } from '@/core/entities/Constraints';
import type { Equipment } from '@/core/entities/Equipment';
import type { Technician } from '@/core/entities/Technician';
import type { EquipmentId, TechnicianId } from '@/core/types/primitives/ids';

export interface Interval {
    start: number;
    end: number;
}

export class ResourceTracker {
    private readonly techIntervals = new Map<TechnicianId, Interval[]>();
    private readonly equipmentSlots = new Map<EquipmentId, Interval[][]>();

    init(technicians: Technician[], equipments: Equipment[], constraints?: Constraints): void {
        this.techIntervals.clear();
        this.equipmentSlots.clear();
        for (const tech of technicians) {
            this.techIntervals.set(tech.id, []);
        }
        const parallelOn = constraints?.parallelProcessing !== false;
        for (const eq of equipments) {
            const capacity = parallelOn ? (eq.capacity ?? 1) : 1;
            const slots: Interval[][] = [];
            for (let i = 0; i < capacity; i += 1) {
                slots.push([]);
            }
            this.equipmentSlots.set(eq.id, slots);
        }
    }

    getTechIntervals(id: TechnicianId): Interval[] {
        return this.techIntervals.get(id) ?? [];
    }

    getSlotIntervals(equipmentId: EquipmentId): Interval[][] {
        return this.equipmentSlots.get(equipmentId) ?? [];
    }

    reserveTech(id: TechnicianId, start: number, end: number): void {
        const list = this.techIntervals.get(id);
        if (list === undefined) {
            return;
        }
        ResourceTracker.insertSorted(list, { start, end });
    }

    reserveSlot(equipmentId: EquipmentId, index: number, start: number, end: number): void {
        const slots = this.equipmentSlots.get(equipmentId);
        if (slots === undefined || slots[index] === undefined) {
            return;
        }
        ResourceTracker.insertSorted(slots[index], { start, end });
    }

    private static insertSorted(list: Interval[], interval: Interval): void {
        let i = 0;
        while (i < list.length && list[i].start <= interval.start) {
            i += 1;
        }
        list.splice(i, 0, interval);
    }
}
