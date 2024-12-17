/**
 * Example JSON to XML Protocol Adapter
 * 
 * Demonstrates adapting between different data serialization formats
 * while preserving structure and metadata.
 */

import { Protocol, ProtocolAdapter, AdapterContext } from '../core/adapter.js';

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
        return this.jsonToXml(data);
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

    private jsonToXml(json: any): string {
        const convert = (obj: any, parentTag?: string): string => {
            if (obj === null || obj === undefined) {
                return parentTag ? `<${parentTag}/>` : '';
            }

            if (typeof obj !== 'object') {
                return parentTag ? 
                    `<${parentTag}>${this.escapeXml(String(obj))}</${parentTag}>` : 
                    this.escapeXml(String(obj));
            }

            if (Array.isArray(obj)) {
                if (obj.length === 0 && parentTag) {
                    return `<${parentTag}></${parentTag}>`;
                }
                return obj.map(item => convert(item, parentTag)).join('');
            }

            const tags: string[] = [];
            const attrs: string[] = [];

            for (const [key, value] of Object.entries(obj)) {
                if (key.startsWith('@')) {
                    attrs.push(`${key.slice(1)}="${this.escapeXml(String(value))}"`); 
                } else {
                    tags.push(convert(value, key));
                }
            }

            const content = tags.join('');
            const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

            if (!parentTag) {
                return `<root${attrStr}>${content}</root>`;
            }

            return `<${parentTag}${attrStr}>${content}</${parentTag}>`;
        };

        return convert(json);
    }

    private xmlToJson(xml: string): any {
        const result: Record<string, any> = {};
        const selfClosingPattern = /<([^\s>]+)((?:\s+[^\s=]+="[^"]*")*?)\s*\/>/g;
        const tagPattern = /<([^\s>]+)((?:\s+[^\s=]+="[^"]*")*?)>([^<]*(?:(?!<\/\1>)<[^<]*)*?)<\/\1>/g;
        const attrPattern = /([^\s=]+)="([^"]*)"/g;

        // Handle self-closing tags
        xml = xml.replace(selfClosingPattern, (_, tag, attrs) => {
            const node: Record<string, any> = {};
            let attrMatch: RegExpExecArray | null;
            while ((attrMatch = attrPattern.exec(attrs || '')) !== null) {
                const [, name, value] = attrMatch;
                node[`@${name}`] = value;
            }
            result[tag] = node;
            return '';
        });

        // Handle regular tags
        let match: RegExpExecArray | null;
        while ((match = tagPattern.exec(xml)) !== null) {
            const [, tag, attrs, content] = match;
            const node: Record<string, any> = {};

            // Parse attributes
            let attrMatch: RegExpExecArray | null;
            while ((attrMatch = attrPattern.exec(attrs || '')) !== null) {
                const [, name, value] = attrMatch;
                node[`@${name}`] = value;
            }

            // Handle content
            if (content.trim()) {
                // Check for nested tags
                if (/<[^>]+>[^<]*<\/[^>]+>/g.test(content)) {
                    Object.assign(node, this.xmlToJson(content));
                } else {
                    node['#text'] = content.trim();
                }
            }

            result[tag] = node;
        }

        return result;
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