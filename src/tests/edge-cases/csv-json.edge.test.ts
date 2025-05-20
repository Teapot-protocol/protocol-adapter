/**
 * Edge case tests for CSV to JSON adapter
 */

import { CsvToJsonAdapter } from '../../implementations/csv-json.adapter.js';

describe('CsvToJsonAdapter Edge Cases', () => {
    let adapter: CsvToJsonAdapter;

    beforeEach(() => {
        adapter = new CsvToJsonAdapter();
    });

    describe('adapt edge cases', () => {
        it('should return empty array for empty input', async () => {
            const result = await adapter.adapt('');
            expect(result).toEqual([]);
        });

        it('should handle rows with missing values', async () => {
            const csv = 'name,age\nAlice\nBob,25';
            const result = await adapter.adapt(csv);
            expect(result).toEqual([
                { name: 'Alice', age: '' },
                { name: 'Bob', age: '25' }
            ]);
        });

        it('should parse quoted values containing delimiter', async () => {
            const csv = 'name,desc\n"Widget, A",simple';
            const result = await adapter.adapt(csv);
            expect(result[0].name).toBe('Widget, A');
        });
    });
});
