import { makeConstraintsEntity } from '@tests/helpers/factories';

describe('Constraints', () => {
    it('exposes DTO fields through accessors', () => {
        const constraints = makeConstraintsEntity({ maxProcessingTime: 300, contaminationPrevention: false, parallelProcessing: true, priorityRules: ['STAT', 'URGENT', 'ROUTINE'] });
        expect(constraints.maxProcessingTime).toBe(300);
        expect(constraints.contaminationPrevention).toBe(false);
        expect(constraints.parallelProcessing).toBe(true);
        expect(constraints.priorityRules).toEqual(['STAT', 'URGENT', 'ROUTINE']);
    });

    it('returns undefined for fields not provided', () => {
        const constraints = makeConstraintsEntity({ maxProcessingTime: undefined, priorityRules: undefined, contaminationPrevention: undefined, parallelProcessing: undefined });
        expect(constraints.maxProcessingTime).toBeUndefined();
        expect(constraints.priorityRules).toBeUndefined();
        expect(constraints.contaminationPrevention).toBeUndefined();
        expect(constraints.parallelProcessing).toBeUndefined();
    });
});
