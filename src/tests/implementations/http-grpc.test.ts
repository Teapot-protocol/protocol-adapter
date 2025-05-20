import { HttpToGrpcAdapter } from '../../implementations/http-grpc.adapter';

describe('HttpToGrpcAdapter', () => {
    let adapter: HttpToGrpcAdapter;

    beforeEach(() => {
        adapter = new HttpToGrpcAdapter();
    });

    describe('adapt', () => {
        it('should transform HTTP request to gRPC format', async () => {
            const httpRequest = {
                method: 'POST',
                path: '/users/create',
                body: {
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            };

            const result = await adapter.adapt(httpRequest, {
                direction: 'forward',
                preserveMetadata: true,
                validationLevel: 'strict'
            });

            expect(result).toEqual({
                service: 'users',
                method: 'POSTcreate',
                message: expect.any(Uint8Array)
            });

            // Verify the message content
            const decodedMessage = JSON.parse(new TextDecoder().decode(result.message));
            expect(decodedMessage).toEqual(httpRequest.body);
        });
    });

    describe('reverse', () => {
        it('should transform gRPC response to HTTP format', async () => {
            const grpcResponse = {
                response: new TextEncoder().encode(JSON.stringify({
                    id: '123',
                    status: 'created'
                })),
                metadata: {
                    status: 0,
                    timestamp: Date.now()
                }
            };

            const result = await adapter.reverse(grpcResponse);

            expect(result).toEqual({
                status: 200,
                body: {
                    id: '123',
                    status: 'created'
                },
                headers: expect.any(Object)
            });

            // Verify headers contain gRPC metadata
            expect(result.headers['x-grpc-status']).toBe('0');
            expect(result.headers['x-grpc-timestamp']).toBeDefined();
        });
    });

    describe('canHandle', () => {
        it('should return true for HTTP to gRPC conversion', () => {
            const canHandle = adapter.canHandle(
                { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
                { name: 'gRPC', version: '1.0', capabilities: [], metadata: {} }
            );

            expect(canHandle).toBe(true);
        });

        it('should return false for unsupported protocols', () => {
            const canHandle = adapter.canHandle(
                { name: 'SOAP', version: '1.1', capabilities: [], metadata: {} },
                { name: 'REST', version: '1.0', capabilities: [], metadata: {} }
            );

            expect(canHandle).toBe(false);
        });
    });

    describe('getCompatibilityScore', () => {
        it('should return a score between 0 and 1', () => {
            const score = adapter.getCompatibilityScore();
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(1);
        });
    });

    describe('status code mapping', () => {
        it('should map gRPC status codes to HTTP status codes', async () => {
            const statuses = {
                0: 200,
                1: 499,
                2: 500,
                3: 400,
                4: 504,
                5: 404,
                6: 409,
                7: 403
            } as Record<number, number>;

            for (const [grpcStatus, httpStatus] of Object.entries(statuses)) {
                const grpcResponse = {
                    response: new TextEncoder().encode('{}'),
                    metadata: { status: Number(grpcStatus) }
                };

                const result = await adapter.reverse(grpcResponse);
                expect(result.status).toBe(httpStatus);
            }
        });
    });
});