/**
 * Example HTTP to gRPC Protocol Adapter
 * 
 * Demonstrates adapting RESTful HTTP endpoints to gRPC services
 */

import { Protocol, ProtocolAdapter, AdapterContext } from '../core/adapter.js';

interface HttpProtocol extends Protocol {
    endpoints: {
        path: string;
        method: string;
        params?: string[];
    }[];
}

interface GrpcProtocol extends Protocol {
    services: {
        name: string;
        methods: {
            name: string;
            inputType: string;
            outputType: string;
        }[];
    }[];
}

export class HttpToGrpcAdapter implements ProtocolAdapter<HttpProtocol, GrpcProtocol> {
    sourceProtocol: HttpProtocol = {
        name: 'HTTP',
        version: '1.1',
        capabilities: ['REST', 'JSON'],
        metadata: {},
        endpoints: []
    };

    targetProtocol: GrpcProtocol = {
        name: 'gRPC',
        version: '1.0',
        capabilities: ['Streaming', 'Protobuf'],
        metadata: {},
        services: []
    };

    async adapt(data: any, context?: AdapterContext): Promise<any> {
        // Transform HTTP request to gRPC call
        const { method, path, body } = data;
        
        // Map HTTP method + path to gRPC service + method
        const grpcMethod = this.mapHttpToGrpc(method, path);
        
        // Transform request body to Protobuf
        const message = this.convertToProtobuf(body || {});
        
        return {
            service: grpcMethod.service,
            method: grpcMethod.method,
            message
        };
    }

    async reverse(data: any, context?: AdapterContext): Promise<any> {
        // Transform gRPC response to HTTP response
        const { response, metadata } = data;
        
        // Convert Protobuf to JSON
        const body = this.convertFromProtobuf(response);
        
        // Map status codes
        const statusCode = this.mapGrpcStatusToHttp(metadata.status);
        
        return {
            status: statusCode,
            body,
            headers: this.convertMetadataToHeaders(metadata)
        };
    }

    canHandle(source: Protocol, target: Protocol): boolean {
        return source.name === 'HTTP' && target.name === 'gRPC';
    }

    getCompatibilityScore(): number {
        return 0.8; // High compatibility but some features may not map perfectly
    }

    private mapHttpToGrpc(method: string, path: string): { service: string; method: string } {
        // Extract base path without query parameters
        const basePath = path.split('?')[0];
        const parts = basePath.split('/').filter(p => p);
        
        if (parts.length < 1) {
            throw new Error('Invalid path format');
        }

        return {
            service: parts[0],
            method: `${method}${parts.slice(1).join('')}`
        };
    }

    private convertToProtobuf(json: any): Uint8Array {
        // Placeholder: Convert JSON to Protobuf
        return new TextEncoder().encode(JSON.stringify(json));
    }

    private convertFromProtobuf(proto: Uint8Array): any {
        // Placeholder: Convert Protobuf to JSON
        try {
            return JSON.parse(new TextDecoder().decode(proto));
        } catch (error) {
            throw new Error('Invalid Protobuf message');
        }
    }

    private mapGrpcStatusToHttp(grpcStatus: number): number {
        const statusMap: Record<number, number> = {
            0: 200,  // OK
            1: 499,  // Cancelled
            2: 500,  // Unknown
            3: 400,  // Invalid Argument
            4: 504,  // Deadline Exceeded
            5: 404,  // Not Found
            6: 409,  // Already Exists
            7: 403,  // Permission Denied
            // ... more mappings
        };
        return statusMap[grpcStatus] || 500;
    }

    private convertMetadataToHeaders(metadata: Record<string, any>): Record<string, string> {
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(metadata)) {
            headers[`x-grpc-${key}`] = String(value);
        }
        return headers;
    }
}