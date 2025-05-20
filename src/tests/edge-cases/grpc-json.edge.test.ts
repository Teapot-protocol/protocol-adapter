/**
 * Edge case tests for gRPC to JSON adapter
 */

import { jest } from '@jest/globals';
import { GrpcToJsonAdapter } from '../../implementations/grpc-json.adapter.js';
import { createMockContext } from '../utils/test-helpers.js';

describe('GrpcToJsonAdapter Edge Cases', () => {
    let adapter: GrpcToJsonAdapter;

    beforeEach(() => {
        adapter = new GrpcToJsonAdapter();
    });

    describe('adapt edge cases', () => {
        it('should throw for invalid JSON message', async () => {
            const grpcData = { message: new TextEncoder().encode('not json') };

            await expect(adapter.adapt(grpcData, createMockContext()))
                .rejects
                .toThrow(SyntaxError);
        });

        it('should throw for empty message', async () => {
            const grpcData = { message: new TextEncoder().encode('') };

            await expect(adapter.adapt(grpcData, createMockContext()))
                .rejects
                .toThrow(SyntaxError);
        });
    });

    describe('reverse edge cases', () => {
        it('should handle null input', async () => {
            const result = await adapter.reverse(null, createMockContext());
            const decoded = JSON.parse(new TextDecoder().decode(result.response));
            expect(decoded).toBeNull();
        });

        it('should throw for circular references', async () => {
            const obj: any = {};
            obj.self = obj;

            await expect(adapter.reverse(obj, createMockContext()))
                .rejects
                .toThrow(TypeError);
        });
    });
});
