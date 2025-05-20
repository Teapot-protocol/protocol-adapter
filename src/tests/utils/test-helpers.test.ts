import { jest } from '@jest/globals';
import {
  createMockProtocol,
  createMockAdapter,
  createMockContext,
  verifyProtocolCompatibility,
  testBidirectionalConversion,
  expectAdapterError
} from './test-helpers.js';

describe('test-helpers utilities', () => {
  describe('createMockProtocol', () => {
    it('should create protocol with given name and version', () => {
      const proto = createMockProtocol('HTTP', '1.1');
      expect(proto).toEqual({ name: 'HTTP', version: '1.1', capabilities: [], metadata: {} });
    });

    it('should default version to 1.0', () => {
      const proto = createMockProtocol('JSON');
      expect(proto.version).toBe('1.0');
    });
  });

  describe('createMockAdapter', () => {
    it('should create adapter using provided protocols', () => {
      const source = createMockProtocol('A');
      const target = createMockProtocol('B');
      const adapter = createMockAdapter(source, target);
      expect(adapter.sourceProtocol).toBe(source);
      expect(adapter.targetProtocol).toBe(target);
      expect(typeof adapter.adapt).toBe('function');
      expect(typeof adapter.reverse).toBe('function');
    });
  });

  describe('createMockContext', () => {
    it('should create context with defaults', () => {
      const ctx = createMockContext();
      expect(ctx).toEqual({
        direction: 'forward',
        preserveMetadata: true,
        validationLevel: 'strict'
      });
    });

    it('should allow overrides', () => {
      const ctx = createMockContext({ direction: 'reverse', preserveMetadata: false });
      expect(ctx.direction).toBe('reverse');
      expect(ctx.preserveMetadata).toBe(false);
      expect(ctx.validationLevel).toBe('strict');
    });
  });

  describe('verifyProtocolCompatibility', () => {
    it('should delegate to adapter methods', () => {
      const source = createMockProtocol('A');
      const target = createMockProtocol('B');
      const adapter = createMockAdapter(source, target);
      const result = verifyProtocolCompatibility(adapter, source, target);
      expect(adapter.canHandle).toHaveBeenCalledWith(source, target);
      expect(adapter.getCompatibilityScore).toHaveBeenCalled();
      expect(result).toEqual({ canHandle: true, compatibilityScore: 1 });
    });
  });

  describe('testBidirectionalConversion', () => {
    it('should return forward and reverse results and detect reversibility', async () => {
      const source = createMockProtocol('A');
      const target = createMockProtocol('B');
      const adapter = createMockAdapter(source, target);
      (adapter.adapt as jest.Mock).mockImplementation(async (d) => ({ value: d.value + 1 }));
      (adapter.reverse as jest.Mock).mockImplementation(async (d) => ({ value: d.value - 1 }));
      const result = await testBidirectionalConversion(adapter, { value: 1 });
      expect(result.forward).toEqual({ value: 2 });
      expect(result.reverse).toEqual({ value: 1 });
      expect(result.isReversible).toBe(true);
    });
  });

  describe('expectAdapterError', () => {
    it('should resolve when error matches type', async () => {
      const promise = Promise.reject(new TypeError('bad'));
      await expect(expectAdapterError(promise, 'TypeError')).resolves.toBeUndefined();
    });

    it('should reject when error type does not match', async () => {
      const promise = Promise.reject(new Error('oops'));
      await expect(expectAdapterError(promise, 'TypeError')).rejects.toThrow();
    });
  });
});
