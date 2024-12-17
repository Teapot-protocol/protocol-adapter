/**
 * Edge case tests for HTTP to gRPC adapter
 */

import { jest } from '@jest/globals';
import { HttpToGrpcAdapter } from '../../implementations/http-grpc.adapter.js';
import { createMockContext } from '../utils/test-helpers.js';

describe('HttpToGrpcAdapter Edge Cases', () => {
    let adapter: HttpToGrpcAdapter;

    beforeEach(() => {
        adapter = new HttpToGrpcAdapter();
    });

    describe('adapt edge cases', () => {
        it('should handle empty request body', async () => {
            const httpRequest = {
                method: 'GET',
                path: '/users',
                body: null
            };

            const result = await adapter.adapt(httpRequest, createMockContext());
            const decodedMessage = JSON.parse(new TextDecoder().decode(result.message));
            expect(decodedMessage).toEqual({});
        });

        it('should handle deeply nested objects', async () => {
            const httpRequest = {
                method: 'POST',
                path: '/data',
                body: {
                    level1: {
                        level2: {
                            level3: {
                                value: 'deep'
                            }
                        }
                    }
                }
            };

            const result = await adapter.adapt(httpRequest, createMockContext());
            const decoded = JSON.parse(new TextDecoder().decode(result.message));
            expect(decoded.level1.level2.level3.value).toBe('deep');
        });

        it('should handle special characters in path', async () => {
            const httpRequest = {
                method: 'GET',
                path: '/users/search?name=John&age=30',
                body: null
            };

            const result = await adapter.adapt(httpRequest, createMockContext());
            expect(result.service).toBe('users');
            expect(result.method).toBe('GETsearch');
        });
    });

    describe('reverse edge cases', () => {
        it('should handle empty gRPC response', async () => {
            const grpcResponse = {
                response: new TextEncoder().encode('{}'),
                metadata: { status: 0 }
            };

            const result = await adapter.reverse(grpcResponse, createMockContext());
            expect(result.status).toBe(200);
            expect(result.body).toEqual({});
        });

        it('should handle non-JSON gRPC response', async () => {
            const grpcResponse = {
                response: new TextEncoder().encode('not json'),
                metadata: { status: 0 }
            };

            await expect(adapter.reverse(grpcResponse, createMockContext()))
                .rejects
                .toThrow('Invalid Protobuf message');
        });

        it('should handle all gRPC status codes', async () => {
            const statusCodes = [0, 1, 2, 3, 4, 5, 6, 7];

            for (const status of statusCodes) {
                const grpcResponse = {
                    response: new TextEncoder().encode('{}'),
                    metadata: { status }
                };

                const result = await adapter.reverse(grpcResponse, createMockContext());
                expect(result.status).toBeDefined();
                expect(typeof result.status).toBe('number');
            }
        });
    });
});