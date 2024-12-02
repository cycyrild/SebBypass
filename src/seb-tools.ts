import { DOMParser } from '@xmldom/xmldom';
import CryptoES  from 'crypto-es';

export interface XMLDictionary {
    [key: string]: XMLValue;
}

export type XMLValue = string | number | boolean | XMLValue[] | XMLDictionary | undefined;

export class SebFile {
    public readonly Dictionnary: XMLDictionary;
    public readonly SerializedJson: string;
    public readonly StartUrl: string | undefined;
    public readonly ConfigHash: string;

    private constructor(dictionnary: XMLDictionary, serializedJson: string, startUrl: string | undefined, configKey: string) {
        this.Dictionnary = dictionnary;
        this.SerializedJson = serializedJson;
        this.StartUrl = startUrl;
        this.ConfigHash = configKey;
    }

    public static async createInstance(sebXML: string): Promise<SebFile|undefined> {
        const dictionnary = parseXMLString(sebXML);
        if (!dictionnary) {
            return;
        }
        const serializedJson = serialize(dictionnary);
        const startUrl = getStartUrl(dictionnary);
        const configHash = getConfigHash(serializedJson);
        return new SebFile(dictionnary, serializedJson, startUrl, configHash);
    }

    public getConfigKey(url: string) {
        return sha256(url + this.ConfigHash);
    }
}

function getConfigHash(serializedJson: string): string {
    return sha256(serializedJson);
}

function getStartUrl(dictionnary: XMLDictionary): string | undefined {
    const startUrl = dictionnary["startURL"];
    if (typeof startUrl === "string") {
        return startUrl;
    }
}

function parseXMLString(htmlString: string): XMLDictionary|undefined {
    let currentKey: string | null = null;

    function processValue(node: Node): XMLValue {
        switch (node.nodeName) {
            case 'true':
                return true;
            case 'false':
                return false;
            case 'integer':
                return parseInt(node.textContent || '0', 10);
            case 'string':
            case 'data':
                return node.textContent?.trim() || '';
            case 'real':
                return parseFloat(node.textContent || '0');
            case 'array':
                return handleArray(node);
            case 'dict':
                return handleDict(node);
            default:
                return undefined;
        }
    }

    function handleNode(node: Node, dict: XMLDictionary): void {
        if (node.nodeType === Node.ELEMENT_NODE) { // Element node
            if (node.nodeName === 'key') {
                currentKey = node.textContent || null;
            } else if (currentKey) {
                const value = processValue(node);
                if (value !== undefined) {
                    dict[currentKey] = value;
                }
                currentKey = null; // Reset currentKey after adding value
            } else {
                Array.from(node.childNodes).forEach(childNode => handleNode(childNode, dict));
            }
        }
    }

    function handleArray(node: Node): XMLValue[] {
        const array: XMLValue[] = [];
        Array.from(node.childNodes).forEach(childNode => {
            if (childNode.nodeType === Node.ELEMENT_NODE) { // Element node
                const value = processValue(childNode);
                if (value !== undefined) {
                    array.push(value);
                }
            }
        });
        return array;
    }

    function handleDict(node: Node): XMLDictionary {
        const nestedDict: XMLDictionary = {};
        let nestedKey: string | null = null;

        Array.from(node.childNodes).forEach(childNode => {
            if (childNode.nodeType === Node.ELEMENT_NODE) { // Element node
                if (childNode.nodeName === 'key') {
                    nestedKey = childNode.textContent || null;
                } else if (nestedKey) {
                    const value = processValue(childNode);
                    if (value !== undefined) {
                        nestedDict[nestedKey] = value;
                    }
                    nestedKey = null; // Reset nestedKey after adding value
                }
            }
        });
        return nestedDict;
    }

    const parser = new DOMParser();
    try {
        const doc = parser.parseFromString(htmlString, 'text/xml');
        const dictionary: XMLDictionary = {};

        const dicts = doc.getElementsByTagName('dict');
        if (dicts.length > 0) {
            const dict = dicts[0];
            Array.from(dict.childNodes).forEach(currentNode => handleNode(currentNode, dictionary));
        }

        return dictionary;
    }
    catch (e) {
        console.error('Error parsing XML:', e);
        return;
    }

}

function serialize(dictionary: XMLDictionary): string {
    function _serialize(value: XMLValue): string {
        if (value && typeof value === 'object') {
            if (Array.isArray(value)) {
                return _serializeList(value);
            } else if (value instanceof Uint8Array) {
                return `"${btoa(String.fromCharCode.apply(null, Array.from(value)))}"`;
            } else if (value instanceof Date) {
                return `"${value.toISOString()}"`;
            } else {
                return serialize(value as XMLDictionary);
            }
        } else if (typeof value === 'boolean' || typeof value === 'number') {
            return value.toString();
        } else if (typeof value === 'string') {
            return `"${value}"`;
        } else if (value === null) {
            return '""';
        } else {
            return '""';
        }
    }

    function _serializeList(list: XMLValue[]): string {
        return '[' + list.map(_serialize).join(',') + ']';
    }

    function serialize(obj: XMLDictionary): string {
        const orderedByKey = Object.keys(obj).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

        let result = '{';
        orderedByKey.forEach((key, index) => {
            const value = obj[key];
            if (
                key.toLowerCase() !== 'originatorversion' &&
                (!(value && typeof value === 'object' && !Array.isArray(value)) || (value && Object.keys(value).length > 0))
            ) {
                result += `"${key}":${_serialize(value)}`;
                if (index !== orderedByKey.length - 1) {
                    result += ',';
                }
            }
        });
        result += '}';
        return result;
    }

    return serialize(dictionary);
}

function sha256(str: string) {
    return CryptoES.SHA256(str).toString(CryptoES.enc.Hex);
}
