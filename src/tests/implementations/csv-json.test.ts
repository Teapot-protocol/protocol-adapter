import { CsvToJsonAdapter } from '../../implementations/csv-json.adapter.js';

describe('CsvToJsonAdapter', () => {
    let adapter: CsvToJsonAdapter;

    beforeEach(() => {
        adapter = new CsvToJsonAdapter();
    });

    describe('adapt', () => {
        it('should convert CSV string to JSON array', async () => {
            const csv = 'name,age\nAlice,30\nBob,25';
            const result = await adapter.adapt(csv);
            expect(result).toEqual([
                { name: 'Alice', age: '30' },
                { name: 'Bob', age: '25' }
            ]);
        });
    });

    describe('reverse', () => {
        it('should convert JSON array to CSV string', async () => {
            const json = [
                { name: 'Alice', age: 30 },
                { name: 'Bob', age: 25 }
            ];
            const result = await adapter.reverse(json);
            expect(result.trim()).toBe('name,age\nAlice,30\nBob,25');
        });
    });

    describe('canHandle', () => {
        it('should return true for CSV to JSON', () => {
            expect(
                adapter.canHandle(
                    { name: 'CSV', version: '1.0', capabilities: [], metadata: {} },
                    { name: 'JSON', version: '1.0', capabilities: [], metadata: {} }
                )
            ).toBe(true);
        });

        it('should return false for unsupported protocols', () => {
            expect(
                adapter.canHandle(
                    { name: 'XML', version: '1.0', capabilities: [], metadata: {} },
                    { name: 'JSON', version: '1.0', capabilities: [], metadata: {} }
                )
            ).toBe(false);
        });
    });

    describe('getCompatibilityScore', () => {
        it('should return a score between 0 and 1', () => {
            const score = adapter.getCompatibilityScore();
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(1);
        });
    });
});
