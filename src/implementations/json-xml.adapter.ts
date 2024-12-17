/**
 * Example JSON to XML Protocol Adapter
 * 
 * Demonstrates adapting between different data serialization formats
 * while preserving structure and metadata.
 */

import { Protocol, ProtocolAdapter, AdapterContext } from '../core/adapter';

interface JsonProtocol extends Protocol {
    schema?: Record<string, any>;
}

interface XmlProtocol extends Protocol {
    dtd?: string;
    namespace?: string;
}

export class JsonToXmlAdapter implements ProtocolAdapter<JsonProtocol, XmlProtocol> {
    sourceProtocol: JsonProtocol = {
        name: 'JSON',
        version: '1.0',
        capabilities: ['Nested', 'Arrays'],
        metadata: {},
        schema: {}
    };

    targetProtocol: XmlProtocol = {
        name: 'XML',
        version: '1.0',
        capabilities: ['Namespaces', 'Attributes'],
        metadata: {},
        namespace: 'http://example.com/protocol'
    };

    async adapt(data: any, context?: AdapterContext): Promise<string> {
        return this.jsonToXml(data, {
            rootTag: 'root',
            indent: context?.preserveMetadata ? 2 : 0
        });
    }

    async reverse(data: string, context?: AdapterContext): Promise<any> {
        return this.xmlToJson(data);
    }

    canHandle(source: Protocol, target: Protocol): boolean {
        return source.name === 'JSON' && target.name === 'XML';
    }

    getCompatibilityScore(): number {
        return 0.9; // Very high compatibility
    }

    private jsonToXml(json: any, options: { rootTag: string; indent: number }): string {
        const { rootTag, indent } = options;

        const convert = (obj: any, tag: string): string => {
            if (obj === null || obj === undefined) {
                return `<${tag}/>`;
            }

            if (typeof obj !== 'object') {
                return `<${tag}>${this.escapeXml(String(obj))}</${tag}>`;
            }

            if (Array.isArray(obj)) {
                return obj.map(item => convert(item, tag)).join(indent ? '\n' : '');
            }

            const attrs: string[] = [];
            const children: string[] = [];

            for (const [key, value] of Object.entries(obj)) {
                if (key.startsWith('@')) {
                    attrs.push(`${key.slice(1)}="${this.escapeXml(String(value))}"`);
                } else {
                    children.push(convert(value, key));
                }
            }

            const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
            const childStr = children.join(indent ? '\n' : '');

            return `<${tag}${attrStr}>${childStr}</${tag}>`;
        };

        return convert(json, rootTag);
    }

    private xmlToJson(xml: string): any {
        // Placeholder: In a real implementation, use a proper XML parser
        const result: any = {};
        
        // Basic XML parsing
        const parseNode = (node: string): any => {
            const tagMatch = node.match(/<([^\s>]+)(\s[^>]*)?>(([^<]|<[^/]|</[^a-zA-Z])*)<\/\1>/);
            if (!tagMatch) return node.replace(/<[^>]*>/g, '').trim();

            const [, tag, attrs, content] = tagMatch;
            const result: any = {};

            // Parse attributes
            if (attrs) {
                const attrMatches = attrs.matchAll(/\s([^\s=]+)="([^"]*)"/g);
                for (const [, name, value] of attrMatches) {
                    result[`@${name}`] = value;
                }
            }

            // Parse content
            if (content.trim()) {
                const childNodes = content.match(/<[^>]+>[^<]*<\/[^>]+>/g);
                if (childNodes) {
                    childNodes.forEach(childNode => {
                        const childResult = parseNode(childNode);
                        const childTag = childNode.match(/<([^\s>]+)/)![1];
                        result[childTag] = childResult;
                    });
                } else {
                    const value = content.trim();
                    if (value) result['#text'] = value;
                }
            }

            return result;
        };

        return parseNode(xml);
    }

    private escapeXml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}