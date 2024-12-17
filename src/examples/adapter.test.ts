/**
 * Protocol Adapter Usage Examples
 * 
 * This file demonstrates how to use the protocol adapter system
 * with different types of protocols and data formats.
 */

import { AdapterRegistry } from '../core/adapter';
import { HttpToGrpcAdapter } from '../implementations/http-grpc.adapter';
import { JsonToXmlAdapter } from '../implementations/json-xml.adapter';

async function demonstrateHttpToGrpc() {
    console.log('=== HTTP to gRPC Adaptation Example ===\n');

    const adapter = new HttpToGrpcAdapter();
    
    // Example HTTP request
    const httpRequest = {
        method: 'POST',
        path: '/users/create',
        body: {
            name: 'John Doe',
            email: 'john@example.com'
        }
    };

    console.log('HTTP Request:', JSON.stringify(httpRequest, null, 2));

    // Adapt HTTP to gRPC
    const grpcRequest = await adapter.adapt(httpRequest, {
        direction: 'forward',
        preserveMetadata: true,
        validationLevel: 'strict'
    });

    console.log('\nConverted to gRPC:', JSON.stringify(grpcRequest, null, 2));

    // Example gRPC response
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

    // Convert back to HTTP
    const httpResponse = await adapter.reverse(grpcResponse);

    console.log('\nConverted back to HTTP:', JSON.stringify(httpResponse, null, 2));
}

async function demonstrateJsonToXml() {
    console.log('\n=== JSON to XML Conversion Example ===\n');

    const adapter = new JsonToXmlAdapter();

    // Example JSON data
    const jsonData = {
        user: {
            '@id': '123',
            name: 'John Doe',
            email: 'john@example.com',
            address: {
                street: '123 Main St',
                city: 'Example City'
            },
            roles: ['admin', 'user']
        }
    };

    console.log('JSON Data:', JSON.stringify(jsonData, null, 2));

    // Convert to XML
    const xmlData = await adapter.adapt(jsonData, {
        direction: 'forward',
        preserveMetadata: true,
        validationLevel: 'strict'
    });

    console.log('\nConverted to XML:', xmlData);

    // Convert back to JSON
    const convertedBack = await adapter.reverse(xmlData);

    console.log('\nConverted back to JSON:', JSON.stringify(convertedBack, null, 2));
}

async function demonstrateAdapterRegistry() {
    console.log('\n=== Adapter Registry Usage Example ===\n');

    const registry = new AdapterRegistry();

    // Register adapters
    registry.register(new HttpToGrpcAdapter());
    registry.register(new JsonToXmlAdapter());

    // Find adapter for HTTP to gRPC
    const httpAdapter = registry.findAdapter(
        { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
        { name: 'gRPC', version: '1.0', capabilities: [], metadata: {} }
    );

    console.log('Found HTTP to gRPC adapter:', !!httpAdapter);
    if (httpAdapter) {
        console.log('Compatibility score:', httpAdapter.getCompatibilityScore());
    }

    // Find adapter for JSON to XML
    const jsonAdapter = registry.findAdapter(
        { name: 'JSON', version: '1.0', capabilities: [], metadata: {} },
        { name: 'XML', version: '1.0', capabilities: [], metadata: {} }
    );

    console.log('\nFound JSON to XML adapter:', !!jsonAdapter);
    if (jsonAdapter) {
        console.log('Compatibility score:', jsonAdapter.getCompatibilityScore());
    }
}

// Run demonstrations
console.log('Protocol Adapter System Demonstration\n');

try {
    await demonstrateHttpToGrpc();
    await demonstrateJsonToXml();
    await demonstrateAdapterRegistry();
    console.log('\n✓ All demonstrations completed successfully');
} catch (error) {
    console.error('\n✗ Error during demonstration:', error);
}