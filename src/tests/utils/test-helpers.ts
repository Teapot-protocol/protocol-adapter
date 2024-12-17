import { Protocol, ProtocolAdapter, AdapterContext } from '../../core/adapter';

/**
 * Creates a mock protocol for testing
 */
export function createMockProtocol(name: string, version: string = '1.0'): Protocol {
    return {
        name,
        version,
        capabilities: [],
        metadata: {}
    };
}

/**
 * Creates a mock adapter for testing
 */
export function createMockAdapter<T extends Protocol, U extends Protocol>(
    sourceProtocol: T,
    targetProtocol: U
): ProtocolAdapter<T, U> {
    return {
        sourceProtocol,
        targetProtocol,
        adapt: jest.fn(),
        reverse: jest.fn(),
        canHandle: jest.fn().mockReturnValue(true),
        getCompatibilityScore: jest.fn().mockReturnValue(1)
    };
}

/**
 * Creates a mock adapter context for testing
 */
export function createMockContext(overrides: Partial<AdapterContext> = {}): AdapterContext {
    return {
        direction: 'forward',
        preserveMetadata: true,
        validationLevel: 'strict',
        ...overrides
    };
}

/**
 * Utility to verify protocol compatibility
 */
export function verifyProtocolCompatibility(
    adapter: ProtocolAdapter<any, any>,
    sourceProtocol: Protocol,
    targetProtocol: Protocol
): {
    canHandle: boolean;
    compatibilityScore: number;
} {
    return {
        canHandle: adapter.canHandle(sourceProtocol, targetProtocol),
        compatibilityScore: adapter.getCompatibilityScore()
    };
}

/**
 * Helper to test bidirectional conversion
 */
export async function testBidirectionalConversion<T, U>(
    adapter: ProtocolAdapter<any, any>,
    sourceData: T,
    context: AdapterContext = createMockContext()
): Promise<{
    forward: U;
    reverse: T;
    isReversible: boolean;
}> {
    const forward = await adapter.adapt(sourceData, context) as U;
    const reverse = await adapter.reverse(forward, {
        ...context,
        direction: 'reverse'
    }) as T;

    return {
        forward,
        reverse,
        isReversible: JSON.stringify(sourceData) === JSON.stringify(reverse)
    };
}

/**
 * Helper to test error handling
 */
export async function expectAdapterError(
    promise: Promise<any>,
    errorType: string
): Promise<void> {
    try {
        await promise;
        fail('Expected an error but none was thrown');
    } catch (error) {
        if (error instanceof Error) {
            expect(error.constructor.name).toBe(errorType);
        } else {
            fail('Caught error is not an Error instance');
        }
    }
}