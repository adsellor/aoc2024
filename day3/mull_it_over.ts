import { readFileSync } from 'fs';

interface TrieNode {
  children: Map<string, TrieNode>;
  isVariable: boolean;
  varName?: string;
  isEnd: boolean;
}

class MemoryProcessor {
  private root: TrieNode;
  
  constructor(pattern: string) {
    this.root = this.createNode();
    this.buildPattern(pattern);
  }

  private createNode(): TrieNode {
    return {
      children: new Map(),
      isVariable: false,
      isEnd: false
    };
  }

  private buildPattern(pattern: string) {
    let current = this.root;
    let i = 0;
    
    while (i < pattern.length) {
      if (pattern[i] === '{') {
        let varName = '';
        i++;
        while (i < pattern.length && pattern[i] !== '}') {
          varName += pattern[i];
          i++;
        }
        const node = this.createNode();
        node.isVariable = true;
        node.varName = varName;
        current.children.set('*', node);
        current = node;
      } else {
        const node = current.children.get(pattern[i]) || this.createNode();
        current.children.set(pattern[i], node);
        current = node;
      }
      i++;
    }
    current.isEnd = true;
  }

  private match(text: string, pos: number): { matched: boolean; vars: Record<string, string>; nextPos: number } {
    const vars: Record<string, string> = {};
    
    const matchHelper = (node: TrieNode, pos: number): number | null => {
      if (node.isEnd) return pos;
      if (pos >= text.length) return null;

      const varNode = node.children.get('*');
      if (varNode?.isVariable) {
        let num = '';
        let numPos = pos;
        while (numPos < text.length && num.length < 3 && text[numPos] >= '0' && text[numPos] <= '9') {
          num += text[numPos++];
        }
        if (num && num.length <= 3) {
          vars[varNode.varName!] = num;
          const result = matchHelper(varNode, numPos);
          if (result !== null) return result;
          delete vars[varNode.varName!];
        }
      }

      const next = node.children.get(text[pos]);
      if (next) {
        const result = matchHelper(next, pos + 1);
        if (result !== null) return result;
      }

      return null;
    };

    const endPos = matchHelper(this.root, pos);
    return { matched: endPos !== null, vars, nextPos: endPos || pos };
  }

  process(text: string): {total: number, withControls: number} {
    let total = 0;
    let withControls = 0;
    let enabled = true;

    for (let i = 0; i < text.length; i++) {
      if (text.startsWith('do()', i)) enabled = true;
      if (text.startsWith("don't()", i)) enabled = false;
      const result = this.match(text, i);
      const n1 = parseInt(result.vars.var1);
      const n2 = parseInt(result.vars.var2);

      if (result.matched) {
        total += n1 * n2;
        i = result.nextPos - 1;
        if(enabled) {
          withControls += n1 * n2;
          i = result.nextPos - 1;
        }
      }
    }

    return { total, withControls };
  }
}


const memoryInput = readFileSync('./memory.txt', 'utf-8');
const processor = new MemoryProcessor('mul({var1},{var2})');
console.log(processor.process(memoryInput));
