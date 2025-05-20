import { Protocol, ProtocolAdapter, AdapterContext } from '../core/adapter.js';

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

interface JsonProtocol extends Protocol {
    schema?: Record<string, any>;
}

export class GrpcToJsonAdapter implements ProtocolAdapter<GrpcProtocol, JsonProtocol> {
    sourceProtocol: GrpcProtocol = {
        name: 'gRPC',
        version: '1.0',
        capabilities: ['Streaming', 'Protobuf'],
        metadata: {},
        services: []
    };

    targetProtocol: JsonProtocol = {
        name: 'JSON',
        version: '1.0',
        capabilities: ['Nested', 'Arrays'],
        metadata: {},
        schema: {}
    };

    async adapt(data: any, context?: AdapterContext): Promise<any> {
        const { message } = data;
        return JSON.parse(new TextDecoder().decode(message));
    }

    async reverse(data: any, context?: AdapterContext): Promise<any> {
        const message = new TextEncoder().encode(JSON.stringify(data));
        return { response: message, metadata: { status: 0 } };
    }

    canHandle(source: Protocol, target: Protocol): boolean {
        return source.name === 'gRPC' && target.name === 'JSON';
    }

    getCompatibilityScore(): number {
        return 0.85;
    }
}
