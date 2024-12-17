/**
 * Edge case tests for JSON to XML adapter
 */

import { JsonToXmlAdapter } from '../../implementations/json-xml.adapter';
import { createMockContext } from '../utils/test-helpers';

describe('JsonToXmlAdapter Edge Cases', () => {
    let adapter: JsonToXmlAdapter;

    beforeEach(() => {
        adapter = new JsonToXmlAdapter();
    });

    describe('adapt edge cases', () => {
        it('should handle null values', async () => {
            const json = {
                user: {
                    name: null,
                    age: null
                }
            };

            const result = await adapter.adapt(json, createMockContext());
            expect(result).toContain('<name/>');
            expect(result).toContain('<age/>');
        });

        it('should handle empty arrays', async () => {
            const json = {
                users: []
            };

            const result = await adapter.adapt(json, createMockContext());
            expect(result).toContain('<users></users>');
        });

        it('should handle mixed content types', async () => {
            const json = {
                data: {
                    string: 'text',
                    number: 123,
                    boolean: true,
                    null: null,
                    array: [1, 'two', false]
                }
            };

            const result = await adapter.adapt(json, createMockContext());
            expect(result).toContain('<string>text</string>');
            expect(result).toContain('<number>123</number>');
            expect(result).toContain('<boolean>true</boolean>');
            expect(result).toContain('<null/>');
            expect(result).toContain('<array>1</array>');
            expect(result).toContain('<array>two</array>');
            expect(result).toContain('<array>false</array>');
        });

        it('should handle special XML characters in attribute values', async () => {
            const json = {
                element: {
                    '@attr': '"quoted" & <tagged>'
                }
            };

            const result = await adapter.adapt(json, createMockContext());
            expect(result).toContain('attr="&quot;quoted&quot; &amp; &lt;tagged&gt;"');
        });
    });

    describe('reverse edge cases', () => {
        it('should handle self-closing tags', async () => {
            const xml = '<root><empty/><also-empty></also-empty></root>';

            const result = await adapter.reverse(xml, createMockContext());
            expect(result.root.empty).toBeDefined();
            expect(result.root['also-empty']).toBeDefined();
        });

        it('should handle mixed content', async () => {
            const xml = '<root>text<child>nested</child>more text</root>';

            const result = await adapter.reverse(xml, createMockContext());
            expect(result.root.child).toBe('nested');
        });

        it('should handle malformed XML gracefully', async () => {
            const malformedXml = '<root><unclosed>content</root>';

            await expect(adapter.reverse(malformedXml, createMockContext()))
                .rejects
                .toThrow();
        });
    });
});