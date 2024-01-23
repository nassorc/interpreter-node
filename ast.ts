import { Token } from "./token";

export interface Node {
  toString(): string;
  tokenLiteral(): string;
};

export interface StatementNode extends Node {}
export interface ExpressionNode  extends Node {}

export class Program implements Node {
  public statements: StatementNode[];
  constructor() {
    this.statements = []
  }
  toString(): string {
    let str = "";
    for (const stmt of this.statements) {
      str += stmt.toString() + '\n';
    }
    return str;
  }
  tokenLiteral(): string {
    return "root Program literal"
  }
}

export class LetStatement implements StatementNode {
  public token: Token;
  public name: Identifier;
  public value: ExpressionNode;

  constructor(token?: Token, name?: Identifier, value?: ExpressionNode) {
    if (token) {
      this.token = token;
    }
    if (name) {
      this.name = name;
    }
    if (value) {
      this.value = value;
    }
  }

  toString(): string {
    let str = "let";
    return `let ${this.name.toString()} = ${this.value.toString()};`;
  }
  tokenLiteral(): string {
    return "let"
  }
}

export class ExpressionStatement implements StatementNode {
  public token: Token;
  public expression: ExpressionNode;

  constructor(token?: Token, expression?: ExpressionNode) {
    if (token) {
      this.token = token;
    }
    if (expression) {
      this.expression = expression;
    }
  }

  toString(): string {
    return this.expression.toString();
  }
  tokenLiteral(): string {
    return "expression statement literal"
  }
}

export class PrefixExpression implements ExpressionNode {
  public token: Token;
  public op: string;
  public right: ExpressionNode;

  constructor(token?: Token, op?: string, right?: ExpressionNode) {
    if (token) {
      this.token = token;
    }
    if (op) {
      this.op = op;
    }
    if (right) {
      this.right = right;
    }
  }
  toString(): string {
    return `(${this.op}${this.right.toString()})`;
  }
  tokenLiteral(): string {
    return "prefix literal"
  }
}

export class InfixExpression implements ExpressionNode {
  public token: Token;
  public left: ExpressionNode;
  public op: string;
  public right: ExpressionNode;

  constructor(token?: Token,left?: ExpressionNode, op?: string, right?: ExpressionNode) {
    if (token) {
      this.token = token;
    }
    if (left) {
      this.left = left;
    }
    if (op) {
      this.op = op;
    }
    if (right) {
      this.right = right;
    }
  }
  toString(): string {
    return `(${this.left.toString()} ${this.op} ${this.right.toString()})`;
  }
  tokenLiteral(): string {
    return "prefix literal"
  }
}


export class IntegerExpression implements ExpressionNode {
  public token: Token;
  public value: number;

  constructor(token?: Token, value?: number) {
    if (token) {
      this.token = token;
    }
    if (value) {
      this.value = value;
    }
  }
  toString(): string {
    return String(this.value);
  }
  tokenLiteral(): string {
    return "int literal"
  }
}

export class Identifier implements ExpressionNode {
  public token: Token
  public value: string

  constructor(token?: Token, value?: string) {
    if (token) {
      this.token = token;
    }
    if (value) {
      this.value = value;
    }
  }
  toString(): string {
    return this.value;
  }
  tokenLiteral(): string {
    return "identifier literal"
  }
}