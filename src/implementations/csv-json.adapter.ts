import { Protocol, ProtocolAdapter, AdapterContext } from '../core/adapter.js';

interface CsvProtocol extends Protocol {
    delimiter: string;
    headers?: string[];
}

interface JsonProtocol extends Protocol {
    schema?: Record<string, any>;
}

export class CsvToJsonAdapter implements ProtocolAdapter<CsvProtocol, JsonProtocol> {
    sourceProtocol: CsvProtocol = {
        name: 'CSV',
        version: '1.0',
        capabilities: ['Delimited'],
        metadata: {},
        delimiter: ',',
        headers: []
    };

    targetProtocol: JsonProtocol = {
        name: 'JSON',
        version: '1.0',
        capabilities: ['Nested', 'Arrays'],
        metadata: {},
        schema: {}
    };

    async adapt(data: string, context?: AdapterContext): Promise<any[]> {
        const delimiter = this.sourceProtocol.delimiter;
        const lines = data.trim().split(/\r?\n/);
        if (!lines.length) {
            return [];
        }
        const headers = this.sourceProtocol.headers && this.sourceProtocol.headers.length
            ? this.sourceProtocol.headers
            : lines.shift()!.split(delimiter);

        return lines.map(line => {
            const values = line.split(delimiter);
            const obj: Record<string, any> = {};
            for (let i = 0; i < headers.length; i++) {
                obj[headers[i]] = values[i] ?? '';
            }
            return obj;
        });
    }

    async reverse(data: any[], context?: AdapterContext): Promise<string> {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        const delimiter = this.sourceProtocol.delimiter;
        const headers = this.sourceProtocol.headers && this.sourceProtocol.headers.length
            ? this.sourceProtocol.headers
            : Object.keys(data[0]);
        const lines = [headers.join(delimiter)];
        for (const row of data) {
            lines.push(headers.map(h => row[h] ?? '').join(delimiter));
        }
        return lines.join('\n');
    }

    canHandle(source: Protocol, target: Protocol): boolean {
        return source.name === 'CSV' && target.name === 'JSON';
    }

    getCompatibilityScore(): number {
        return 0.75;
    }
}
