import { jest } from '@jest/globals';
import { AdapterRegistry, Protocol, ProtocolAdapter } from '../../core/adapter.js';

describe('AdapterRegistry', () => {
    let registry: AdapterRegistry;

    beforeEach(() => {
        registry = new AdapterRegistry();
    });

    describe('register', () => {
        it('should successfully register a new adapter', () => {
            const mockAdapter = createMockAdapter('Protocol1', 'Protocol2');
            registry.register(mockAdapter);
            
            const found = registry.findAdapter(
                { name: 'Protocol1', version: '1.0', capabilities: [], metadata: {} },
                { name: 'Protocol2', version: '1.0', capabilities: [], metadata: {} }
            );
            
            expect(found).toBe(mockAdapter);
        });

        it('should override existing adapter for same protocols', () => {
            const mockAdapter1 = createMockAdapter('Protocol1', 'Protocol2');
            const mockAdapter2 = createMockAdapter('Protocol1', 'Protocol2');
            
            registry.register(mockAdapter1);
            registry.register(mockAdapter2);
            
            const found = registry.findAdapter(
                { name: 'Protocol1', version: '1.0', capabilities: [], metadata: {} },
                { name: 'Protocol2', version: '1.0', capabilities: [], metadata: {} }
            );
            
            expect(found).toBe(mockAdapter2);
        });
    });

    describe('findAdapter', () => {
        it('should find adapter by exact protocol match', () => {
            const mockAdapter = createMockAdapter('Protocol1', 'Protocol2');
            registry.register(mockAdapter);
            
            const found = registry.findAdapter(
                { name: 'Protocol1', version: '1.0', capabilities: [], metadata: {} },
                { name: 'Protocol2', version: '1.0', capabilities: [], metadata: {} }
            );
            
            expect(found).toBe(mockAdapter);
        });

        it('should find adapter by compatibility check', () => {
            const mockAdapter = createMockAdapter('Protocol1', 'Protocol2', true);
            registry.register(mockAdapter);
            
            const found = registry.findAdapter(
                { name: 'Protocol1', version: '2.0', capabilities: [], metadata: {} },
                { name: 'Protocol2', version: '2.0', capabilities: [], metadata: {} }
            );
            
            expect(found).toBe(mockAdapter);
        });

        it('should return null when no adapter is found', () => {
            const found = registry.findAdapter(
                { name: 'Unknown1', version: '1.0', capabilities: [], metadata: {} },
                { name: 'Unknown2', version: '1.0', capabilities: [], metadata: {} }
            );
            
            expect(found).toBeNull();
        });

        it('should handle multiple compatible adapters', () => {
            const mockAdapter1 = createMockAdapter('Protocol1', 'Protocol2', true);
            const mockAdapter2 = createMockAdapter('Protocol1', 'Protocol2', true);
            
            registry.register(mockAdapter1);
            registry.register(mockAdapter2);
            
            const found = registry.findAdapter(
                { name: 'Protocol1', version: '2.0', capabilities: [], metadata: {} },
                { name: 'Protocol2', version: '2.0', capabilities: [], metadata: {} }
            );
            
            expect(found).toBe(mockAdapter2); // Should return the last registered adapter
        });
    });
});

function createMockAdapter(
    sourceName: string,
    targetName: string,
    alwaysCompatible = false
): ProtocolAdapter<Protocol, Protocol> {
    return {
        sourceProtocol: {
            name: sourceName,
            version: '1.0',
            capabilities: [],
            metadata: {}
        },
        targetProtocol: {
            name: targetName,
            version: '1.0',
            capabilities: [],
            metadata: {}
        },
        adapt: jest.fn().mockImplementation(async (data: any) => data),
        reverse: jest.fn().mockImplementation(async (data: any) => data),
        canHandle: jest.fn().mockImplementation((source: Protocol, target: Protocol) => {
            return alwaysCompatible || (source.name === sourceName && target.name === targetName);
        }),
        getCompatibilityScore: jest.fn().mockReturnValue(1)
    };
}