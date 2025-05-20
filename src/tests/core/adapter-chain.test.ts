import { AdapterRegistry, Protocol, ProtocolAdapter } from '../../core/adapter.js';
import { AdapterChainBuilder } from '../../core/adapter-chain.js';
import { HttpToGrpcAdapter } from '../../implementations/http-grpc.adapter.js';
import { GrpcToJsonAdapter } from '../../implementations/grpc-json.adapter.js';
import { JsonToXmlAdapter } from '../../implementations/json-xml.adapter.js';
import { CsvToJsonAdapter } from '../../implementations/csv-json.adapter.js';
import { createMockContext } from '../utils/test-helpers.js';

describe('AdapterChainBuilder', () => {
    it('should build a chain from HTTP to XML', async () => {
        const registry = new AdapterRegistry();
        registry.register(new HttpToGrpcAdapter());
        registry.register(new GrpcToJsonAdapter());
        registry.register(new JsonToXmlAdapter());

        const builder = new AdapterChainBuilder(registry);
        const chain = builder.buildChain(
            { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
            { name: 'XML', version: '1.0', capabilities: [], metadata: {} }
        );

        expect(chain).toBeTruthy();

        const httpRequest = {
            method: 'POST',
            path: '/users',
            body: { name: 'Alice' }
        };

        const xml = await chain!.adapt(httpRequest, createMockContext());
        expect(xml).toContain('<name>Alice</name>');
    });

    it('should prefer the highest compatibility chain', () => {
        const registry = new AdapterRegistry();

        class HttpToJsonLowCompat implements ProtocolAdapter<Protocol, Protocol> {
            sourceProtocol = { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} };
            targetProtocol = { name: 'JSON', version: '1.0', capabilities: [], metadata: {} };
            adapt = async (d: any) => d;
            reverse = async (d: any) => d;
            canHandle() { return true; }
            getCompatibilityScore() { return 0.2; }
        }

        registry.register(new HttpToJsonLowCompat());
        registry.register(new HttpToGrpcAdapter());
        registry.register(new GrpcToJsonAdapter());
        registry.register(new JsonToXmlAdapter());

        const builder = new AdapterChainBuilder(registry);
        const chain = builder.buildChain(
            { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
            { name: 'XML', version: '1.0', capabilities: [], metadata: {} }
        );

        expect(chain).toBeTruthy();
        const adapters = chain!.getAdapters();
        expect(adapters.some(a => a instanceof HttpToJsonLowCompat)).toBe(false);
    });

    it('should build a chain from CSV to XML', async () => {
        const registry = new AdapterRegistry();
        registry.register(new CsvToJsonAdapter());
        registry.register(new JsonToXmlAdapter());

        const builder = new AdapterChainBuilder(registry);
        const chain = builder.buildChain(
            { name: 'CSV', version: '1.0', capabilities: [], metadata: {} },
            { name: 'XML', version: '1.0', capabilities: [], metadata: {} }
        );

        expect(chain).toBeTruthy();

        const csv = 'name,age\nAlice,30';
        const xml = await chain!.adapt(csv, createMockContext());
        expect(xml).toContain('<name>Alice</name>');
    });
});
