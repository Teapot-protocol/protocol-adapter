/**
 * Integration tests for adapter chain functionality
 */

import { jest } from '@jest/globals';
import { AdapterRegistry } from '../../core/adapter.js';
import { HttpToGrpcAdapter } from '../../implementations/http-grpc.adapter.js';
import { JsonToXmlAdapter } from '../../implementations/json-xml.adapter.js';
import { createMockContext } from '../utils/test-helpers.js';

describe('Adapter Chain Integration', () => {
    let registry: AdapterRegistry;

    beforeEach(() => {
        registry = new AdapterRegistry();
        registry.register(new HttpToGrpcAdapter());
        registry.register(new JsonToXmlAdapter());
    });

    it('should handle complex protocol transformations', async () => {
        // Start with HTTP request
        const httpRequest = {
            method: 'POST',
            path: '/users/create',
            body: {
                user: {
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            }
        };

        // First transform HTTP to gRPC
        const httpToGrpcAdapter = registry.findAdapter(
            { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
            { name: 'gRPC', version: '1.0', capabilities: [], metadata: {} }
        );

        expect(httpToGrpcAdapter).toBeTruthy();

        const grpcResult = await httpToGrpcAdapter!.adapt(httpRequest, createMockContext());

        // Then transform the body to XML
        const jsonToXmlAdapter = registry.findAdapter(
            { name: 'JSON', version: '1.0', capabilities: [], metadata: {} },
            { name: 'XML', version: '1.0', capabilities: [], metadata: {} }
        );

        expect(jsonToXmlAdapter).toBeTruthy();

        const xmlBody = await jsonToXmlAdapter!.adapt(
            JSON.parse(new TextDecoder().decode(grpcResult.message)),
            createMockContext()
        );

        // Verify the final XML output
        expect(xmlBody).toContain('<root>');
        expect(xmlBody).toContain('<user>');
        expect(xmlBody).toContain('<name>John Doe</name>');
        expect(xmlBody).toContain('<email>john@example.com</email>');
        expect(xmlBody).toContain('</user>');
        expect(xmlBody).toContain('</root>');
    });

    it('should handle reverse transformations', async () => {
        // Start with XML
        const xmlData = '<root><user><name>John Doe</name><email>john@example.com</email></user></root>';

        // First convert XML to JSON
        const jsonToXmlAdapter = registry.findAdapter(
            { name: 'JSON', version: '1.0', capabilities: [], metadata: {} },
            { name: 'XML', version: '1.0', capabilities: [], metadata: {} }
        );

        const jsonResult = await jsonToXmlAdapter!.reverse(xmlData, createMockContext());

        // Then convert to HTTP response
        const httpToGrpcAdapter = registry.findAdapter(
            { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
            { name: 'gRPC', version: '1.0', capabilities: [], metadata: {} }
        );

        const grpcResponse = {
            response: new TextEncoder().encode(JSON.stringify(jsonResult)),
            metadata: { status: 0 }
        };

        const httpResponse = await httpToGrpcAdapter!.reverse(grpcResponse, createMockContext());

        expect(httpResponse.status).toBe(200);
        expect(httpResponse.body).toEqual({
            user: {
                name: { '#text': 'John Doe' },
                email: { '#text': 'john@example.com' }
            }
        });
    });
});