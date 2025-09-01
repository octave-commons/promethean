declare module 'unist-util-to-string-with-nodes' {
    import type { Node } from 'unist';
    type StringWithNodes = { text: string; nodes: Node[] };
    function toString(node: Node): StringWithNodes;
    export default toString;
}
