import type { Equipment } from '@/core/entities/Equipment';
import type { Technician } from '@/core/entities/Technician';
import type { EquipmentId } from '@/core/types/models/equipment';
import type { TechnicianId } from '@/core/types/models/technician';
import { parseTime } from '@/core/utils/time';

export class ResourceTracker {
    private readonly techNextFree = new Map<TechnicianId, number>();
    private readonly equipmentSlots = new Map<EquipmentId, number[]>();

    init(technicians: Technician[], equipments: Equipment[]): void {
        this.techNextFree.clear();
        this.equipmentSlots.clear();
        for (const tech of technicians) {
            this.techNextFree.set(tech.getId(), parseTime(tech.getStartTime()));
        }
        for (const eq of equipments) {
            this.equipmentSlots.set(eq.getId(), new Array(eq.getCapacity()).fill(0));
        }
    }

    getTechReady(id: TechnicianId): number {
        return this.techNextFree.get(id)!;
    }

    setTechReady(id: TechnicianId, nextFree: number): void {
        this.techNextFree.set(id, nextFree);
    }

    getEarliestSlot(id: EquipmentId): { index: number; readyAt: number } {
        const slots = this.equipmentSlots.get(id)!;
        let minIndex = 0;
        for (let i = 1; i < slots.length; i += 1) {
            if (slots[i] < slots[minIndex]) {
                minIndex = i;
            }
        }
        return { index: minIndex, readyAt: slots[minIndex] };
    }

    useSlot(id: EquipmentId, index: number, nextFree: number): void {
        const slots = this.equipmentSlots.get(id)!;
        slots[index] = nextFree;
    }
}
