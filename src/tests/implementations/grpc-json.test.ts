import { GrpcToJsonAdapter } from '../../implementations/grpc-json.adapter.js';

describe('GrpcToJsonAdapter', () => {
    let adapter: GrpcToJsonAdapter;

    beforeEach(() => {
        adapter = new GrpcToJsonAdapter();
    });

    describe('adapt', () => {
        it('should convert gRPC message to JSON', async () => {
            const data = { message: new TextEncoder().encode(JSON.stringify({ foo: 'bar' })) };
            const result = await adapter.adapt(data);
            expect(result).toEqual({ foo: 'bar' });
        });
    });

    describe('reverse', () => {
        it('should convert JSON to gRPC response', async () => {
            const json = { foo: 'bar' };
            const result = await adapter.reverse(json);
            expect(result.response).toBeInstanceOf(Uint8Array);
            expect(JSON.parse(new TextDecoder().decode(result.response))).toEqual(json);
        });
    });

    describe('canHandle', () => {
        it('should return true for gRPC to JSON', () => {
            expect(
                adapter.canHandle(
                    { name: 'gRPC', version: '1.0', capabilities: [], metadata: {} },
                    { name: 'JSON', version: '1.0', capabilities: [], metadata: {} }
                )
            ).toBe(true);
        });

        it('should return false for unsupported protocols', () => {
            expect(
                adapter.canHandle(
                    { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
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
