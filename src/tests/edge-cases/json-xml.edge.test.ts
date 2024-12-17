/**
 * Edge case tests for JSON to XML adapter
 */

import { jest } from '@jest/globals';
import { JsonToXmlAdapter } from '../../implementations/json-xml.adapter.js';
import { createMockContext } from '../utils/test-helpers.js';

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
            expect(result).toContain('<root>');
            expect(result).toContain('<user>');
            expect(result).toContain('<name/>');
            expect(result).toContain('<age/>');
            expect(result).toContain('</user>');
            expect(result).toContain('</root>');
        });

        it('should handle empty arrays', async () => {
            const json = {
                users: []
            };

            const result = await adapter.adapt(json, createMockContext());
            expect(result).toBe('<root><users></users></root>');
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
            expect(result).toContain('<root>');
            expect(result).toContain('<data>');
            expect(result).toContain('<string>text</string>');
            expect(result).toContain('<number>123</number>');
            expect(result).toContain('<boolean>true</boolean>');
            expect(result).toContain('<null/>');
            expect(result).toContain('<array>1</array>');
            expect(result).toContain('<array>two</array>');
            expect(result).toContain('<array>false</array>');
            expect(result).toContain('</data>');
            expect(result).toContain('</root>');
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

        it('should handle deeply nested structures', async () => {
            const json = {
                level1: {
                    level2: {
                        level3: {
                            value: 'deep'
                        }
                    }
                }
            };

            const result = await adapter.adapt(json, createMockContext());
            expect(result).toContain('<level1><level2><level3><value>deep</value></level3></level2></level1>');
        });
    });

    describe('reverse edge cases', () => {
        it('should handle self-closing tags', async () => {
            const xml = '<root><empty/><also-empty></also-empty></root>';

            const result = await adapter.reverse(xml, createMockContext());
            expect(result.root.empty).toEqual({});
            expect(result.root['also-empty']).toEqual({});
        });

        it('should handle mixed content', async () => {
            const xml = '<root><child>nested</child></root>';

            const result = await adapter.reverse(xml, createMockContext());
            expect(result.root.child['#text']).toBe('nested');
        });

        it('should handle attributes with self-closing tags', async () => {
            const xml = '<root><element attr="value"/></root>';

            const result = await adapter.reverse(xml, createMockContext());
            expect(result.root.element['@attr']).toBe('value');
        });

        it('should handle malformed XML gracefully', async () => {
            const malformedXml = '<root><unclosed>content</root>';

            const result = await adapter.reverse(malformedXml, createMockContext());
            expect(result).toEqual({});
        });
    });
});