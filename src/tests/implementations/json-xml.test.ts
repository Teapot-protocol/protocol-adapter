import { JsonToXmlAdapter } from '../../implementations/json-xml.adapter';

describe('JsonToXmlAdapter', () => {
    let adapter: JsonToXmlAdapter;

    beforeEach(() => {
        adapter = new JsonToXmlAdapter();
    });

    describe('adapt', () => {
        it('should convert simple JSON to XML', async () => {
            const json = {
                user: {
                    name: 'John Doe',
                    age: 30
                }
            };

            const result = await adapter.adapt(json, {
                direction: 'forward',
                preserveMetadata: true,
                validationLevel: 'strict'
            });

            expect(result).toContain('<user>');
            expect(result).toContain('<name>John Doe</name>');
            expect(result).toContain('<age>30</age>');
            expect(result).toContain('</user>');
        });

        it('should handle XML attributes in JSON', async () => {
            const json = {
                user: {
                    '@id': '123',
                    name: 'John Doe'
                }
            };

            const result = await adapter.adapt(json);

            expect(result).toContain('<user id="123">');
            expect(result).toContain('<name>John Doe</name>');
        });

        it('should handle arrays in JSON', async () => {
            const json = {
                users: [
                    { name: 'John' },
                    { name: 'Jane' }
                ]
            };

            const result = await adapter.adapt(json);

            expect(result).toContain('<users>');
            expect(result).toContain('<name>John</name>');
            expect(result).toContain('<name>Jane</name>');
            expect(result).toContain('</users>');
        });

        it('should escape special characters', async () => {
            const json = {
                data: {
                    text: '<Hello & World>'
                }
            };

            const result = await adapter.adapt(json);

            expect(result).toContain('&lt;Hello &amp; World&gt;');
        });
    });

    describe('reverse', () => {
        it('should convert simple XML to JSON', async () => {
            const xml = '<user><name>John Doe</name><age>30</age></user>';

            const result = await adapter.reverse(xml);

            expect(result).toEqual({
                user: {
                    name: 'John Doe',
                    age: '30'
                }
            });
        });
    });

    describe('canHandle', () => {
        it('should return true for JSON to XML conversion', () => {
            const canHandle = adapter.canHandle(
                { name: 'JSON', version: '1.0', capabilities: [], metadata: {} },
                { name: 'XML', version: '1.0', capabilities: [], metadata: {} }
            );

            expect(canHandle).toBe(true);
        });

        it('should return false for unsupported protocols', () => {
            const canHandle = adapter.canHandle(
                { name: 'YAML', version: '1.0', capabilities: [], metadata: {} },
                { name: 'CSV', version: '1.0', capabilities: [], metadata: {} }
            );

            expect(canHandle).toBe(false);
        });
    });

    describe('getCompatibilityScore', () => {
        it('should return a high compatibility score', () => {
            const score = adapter.getCompatibilityScore();
            expect(score).toBeGreaterThanOrEqual(0.9);
            expect(score).toBeLessThanOrEqual(1);
        });
    });
});