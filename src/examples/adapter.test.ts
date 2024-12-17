/**
 * Protocol Adapter Usage Examples
 */

import { AdapterRegistry } from '../core/adapter.js';
import { HttpToGrpcAdapter } from '../implementations/http-grpc.adapter.js';
import { JsonToXmlAdapter } from '../implementations/json-xml.adapter.js';

describe('Protocol Adapter Examples', () => {
    describe('HTTP to gRPC Adaptation', () => {
        it('should demonstrate HTTP to gRPC conversion', async () => {
            const adapter = new HttpToGrpcAdapter();
            
            const httpRequest = {
                method: 'POST',
                path: '/users/create',
                body: {
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            };

            const grpcRequest = await adapter.adapt(httpRequest, {
                direction: 'forward',
                preserveMetadata: true,
                validationLevel: 'strict'
            });

            expect(grpcRequest.service).toBe('users');
            expect(grpcRequest.method).toBe('POSTcreate');
            expect(grpcRequest.message).toBeInstanceOf(Uint8Array);

            const decodedMessage = JSON.parse(new TextDecoder().decode(grpcRequest.message));
            expect(decodedMessage).toEqual(httpRequest.body);
        });
    });

    describe('JSON to XML Conversion', () => {
        it('should demonstrate JSON to XML conversion', async () => {
            const adapter = new JsonToXmlAdapter();

            const jsonData = {
                user: {
                    '@id': '123',
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            };

            const xmlData = await adapter.adapt(jsonData, {
                direction: 'forward',
                preserveMetadata: true,
                validationLevel: 'strict'
            });

            expect(xmlData).toContain('<user id="123">');
            expect(xmlData).toContain('<name>John Doe</name>');
            expect(xmlData).toContain('<email>john@example.com</email>');
            expect(xmlData).toContain('</user>');
        });
    });

    describe('Adapter Registry', () => {
        it('should demonstrate adapter discovery', () => {
            const registry = new AdapterRegistry();

            registry.register(new HttpToGrpcAdapter());
            registry.register(new JsonToXmlAdapter());

            const httpAdapter = registry.findAdapter(
                { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
                { name: 'gRPC', version: '1.0', capabilities: [], metadata: {} }
            );

            expect(httpAdapter).toBeTruthy();
            expect(httpAdapter?.getCompatibilityScore()).toBeGreaterThan(0);

            const jsonAdapter = registry.findAdapter(
                { name: 'JSON', version: '1.0', capabilities: [], metadata: {} },
                { name: 'XML', version: '1.0', capabilities: [], metadata: {} }
            );

            expect(jsonAdapter).toBeTruthy();
            expect(jsonAdapter?.getCompatibilityScore()).toBeGreaterThan(0);
        });
    });
});