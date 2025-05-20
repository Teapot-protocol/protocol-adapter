/**
 * Protocol Adapter Core System
 * 
 * Goal:
 * Provide a flexible and powerful system for adapting any protocol to any other protocol,
 * enabling seamless communication and data transformation between different systems.
 * 
 * Key Features:
 * - Universal Protocol Adaptation
 * - Bidirectional Transformation
 * - Perfect Data Preservation
 * - Dynamic Protocol Discovery
 */

/**
 * Represents any protocol that can be adapted
 */
export interface Protocol {
    name: string;
    version: string;
    capabilities: string[];
    metadata: Record<string, any>;
}

/**
 * Core adapter interface for transforming between protocols
 */
export interface ProtocolAdapter<From extends Protocol, To extends Protocol> {
    /**
     * Source protocol specification
     */
    sourceProtocol: From;

    /**
     * Target protocol specification
     */
    targetProtocol: To;

    /**
     * Transform data from source protocol to target protocol
     */
    adapt(data: any, context?: AdapterContext): Promise<any>;

    /**
     * Transform data back from target protocol to source protocol
     */
    reverse(data: any, context?: AdapterContext): Promise<any>;

    /**
     * Verify if the adapter can handle the given protocols
     */
    canHandle(source: Protocol, target: Protocol): boolean;

    /**
     * Get compatibility score between protocols (0-1)
     */
    getCompatibilityScore(): number;
}

/**
 * Context information for adaptation process
 */
export interface AdapterContext {
    direction: 'forward' | 'reverse';
    preserveMetadata: boolean;
    validationLevel: 'strict' | 'lenient';
    transformationRules?: Record<string, any>;
    customHandlers?: Record<string, Function>;
}

/**
 * Registry for managing and discovering protocol adapters
 */
export class AdapterRegistry {
    private adapters: Map<string, ProtocolAdapter<any, any>>;

    constructor() {
        this.adapters = new Map();
    }

    /**
     * Register a new protocol adapter
     */
    register(adapter: ProtocolAdapter<any, any>): void {
        const key = this.getAdapterKey(adapter.sourceProtocol, adapter.targetProtocol);
        this.adapters.set(key, adapter);
    }

    /**
     * Remove an adapter for the given protocols
     * @returns true if an adapter was removed
     */
    unregister(source: Protocol, target: Protocol): boolean {
        const key = this.getAdapterKey(source, target);
        return this.adapters.delete(key);
    }

    /**
     * Find an adapter that can transform between given protocols
     */
    findAdapter(source: Protocol, target: Protocol): ProtocolAdapter<any, any> | null {
        const directKey = this.getAdapterKey(source, target);
        if (this.adapters.has(directKey)) {
            return this.adapters.get(directKey)!;
        }

        // Look for compatible adapters
        for (const adapter of this.adapters.values()) {
            if (adapter.canHandle(source, target)) {
                return adapter;
            }
        }

        return null;
    }

    /**
     * Get all registered adapters
     */
    getAdapters(): ProtocolAdapter<any, any>[] {
        return Array.from(this.adapters.values());
    }

    /**
     * Create a unique key for adapter lookup
     */
    private getAdapterKey(source: Protocol, target: Protocol): string {
        return `${source.name}@${source.version}->${target.name}@${target.version}`;
    }
}