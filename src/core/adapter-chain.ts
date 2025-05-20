import { Protocol, ProtocolAdapter, AdapterContext, AdapterRegistry } from './adapter.js';

/**
 * Represents an ordered chain of protocol adapters to transform data
 * across multiple protocol boundaries.
 */
export class AdapterChain<From = any, To = any> {
    constructor(private readonly chain: ProtocolAdapter<any, any>[]) {}

    /**
     * Sequentially adapt the data through the adapter chain.
     */
    async adapt(data: From, context?: AdapterContext): Promise<To> {
        let result: any = data;
        for (const adapter of this.chain) {
            result = await adapter.adapt(result, context);
        }
        return result as To;
    }

    /**
     * Reverse the transformation through the chain in reverse order.
     */
    async reverse(data: To, context?: AdapterContext): Promise<From> {
        let result: any = data;
        for (const adapter of [...this.chain].reverse()) {
            result = await adapter.reverse(result, context);
        }
        return result as From;
    }

    /**
     * Get adapters that compose this chain.
     */
    getAdapters(): ProtocolAdapter<any, any>[] {
        return [...this.chain];
    }

    get sourceProtocol(): Protocol | null {
        return this.chain.length ? this.chain[0].sourceProtocol : null;
    }

    get targetProtocol(): Protocol | null {
        return this.chain.length ? this.chain[this.chain.length - 1].targetProtocol : null;
    }
}

/**
 * Utility for discovering a chain of adapters from a registry
 * connecting a source protocol to a target protocol.
 */
export class AdapterChainBuilder {
    constructor(private readonly registry: AdapterRegistry) {}

    buildChain(source: Protocol, target: Protocol): AdapterChain | null {
        type Node = { protocol: Protocol; chain: ProtocolAdapter<any, any>[]; cost: number };
        const queue: Node[] = [];
        const bestCost = new Map<string, number>();

        queue.push({ protocol: source, chain: [], cost: 0 });
        bestCost.set(this.protocolKey(source), 0);

        while (queue.length) {
            queue.sort((a, b) => a.cost - b.cost);
            const { protocol, chain, cost } = queue.shift()!;

            if (this.isSameProtocol(protocol, target)) {
                return new AdapterChain(chain);
            }

            for (const adapter of this.registry.getAdapters()) {
                if (this.isSameProtocol(adapter.sourceProtocol, protocol)) {
                    const next = adapter.targetProtocol;
                    const adapterCost = 1 - adapter.getCompatibilityScore();
                    const newCost = cost + adapterCost;
                    const key = this.protocolKey(next);

                    if (!bestCost.has(key) || newCost < bestCost.get(key)!) {
                        bestCost.set(key, newCost);
                        queue.push({ protocol: next, chain: [...chain, adapter], cost: newCost });
                    }
                }
            }
        }

        return null;
    }

    private protocolKey(p: Protocol): string {
        return `${p.name}@${p.version}`;
    }

    private isSameProtocol(a: Protocol, b: Protocol): boolean {
        return a.name === b.name && a.version === b.version;
    }
}
