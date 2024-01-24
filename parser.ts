import { ExpressionNode, LetStatement, Program, StatementNode, Identifier, ExpressionStatement, IntegerExpression, PrefixExpression, InfixExpression } from "./ast";
import { type Lexer, createLexer } from "./lexer";
import { type Token } from "./token";
import * as token from "./token";

// goal of parser is to take lexer output as input
// and parse an ast tree

enum Precedence {
  LOWEST,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
}
// Parenthesis has the lowest precedence. This will stop the recursive step when peekToken is token.RPAREN.
// A + B * C
// With this expression, we create an infix expression with A being the left value and + being the operator.
// Because + has a lower precedence than *, we continue on with the recursive step, going deeper into the 
// expression. So, instead the first infix's right value being B, we call parseExpression again, creating a
// IntExpression, and then the for loop creates a new infix expression for the * operator that consumes the 
// the left statement which is B. Once we create the second infix operator: L: B, R: C, Op: *, we return
// the infix operator which will be consumed by the first infix expression.
const precedences = new Map<token.TokenType, Precedence>([
  [token.PLUS, Precedence.SUM],
  [token.MINUS, Precedence.SUM],
  [token.ASTERISK, Precedence.PRODUCT],
  [token.SLASH, Precedence.PRODUCT],
]);

export function createParser(lexer: Lexer) {
  if (lexer == undefined || lexer == null) {
    throw new Error("Missing lexer argument.");
  }

  const state: {l: Lexer, curToken?: Token, peekToken?: Token, errors: string[] } = {
    l: lexer,
    curToken: undefined,
    peekToken: undefined,
    errors: []
  }
  let prefixParseFnMap: Map<token.TokenType, () => ExpressionNode | null>;
  let infixParseFnMap: Map<token.TokenType, (left: ExpressionNode) => ExpressionNode | null>;

  init();

  function init() {
    nextToken();
    nextToken();
    prefixParseFnMap = new Map(); 
    infixParseFnMap = new Map(); 

    prefixParseFnMap.set(token.INT, parseIntegerLiteral);
    prefixParseFnMap.set(token.MINUS, parsePrefixExpression);

    infixParseFnMap.set(token.PLUS, parseInfixExpression);
    infixParseFnMap.set(token.MINUS, parseInfixExpression);
    infixParseFnMap.set(token.ASTERISK, parseInfixExpression);
    infixParseFnMap.set(token.SLASH, parseInfixExpression);

    prefixParseFnMap.set(token.LPAREN, parseGroupExpression);
  }

  function parseProgram(): Program {
    let program = new Program();

    while(state.curToken?.type != token.EOF) {
      let stmt = parseStatement();
      if (stmt) {
        program.statements.push(stmt)
      }
    }

    return program;
  }

  function parseStatement(): StatementNode | null {
    let stmt: StatementNode | null = null;

    switch (state.curToken?.type) {
      case token.LET:
        stmt = parseLetStatement() as StatementNode;
        break;
      default:
        stmt = parseExpressionStatement() as StatementNode;
        break;
    }

    nextToken();

    return stmt
  }

  function nextToken() {
    state.curToken = state.peekToken;
    state.peekToken = state.l.nextToken();
  }

  function parseLetStatement(): LetStatement | null {
    if (state.curToken == undefined) return null;
    let letStmt: LetStatement = new LetStatement(state.curToken);

    if (!expectPeek(token.IDENTIFIER)) {
      return null;
    }

    let name = new Identifier(state.curToken, state.curToken.literal);
    letStmt.name = name;

    if (!expectPeek(token.ASSIGN)) {
      return null
    }

    if (!expectPeek(token.INT)) {
      return null;
    }

    let value = parseExpression(Precedence.LOWEST);

    letStmt.value = value as ExpressionNode;

    while(!currentTokenIs(token.SEMICOLON)) {
      nextToken();
    }

    return letStmt;
  }
  
  function parseExpressionStatement(): ExpressionStatement | null {
    let stmt = new ExpressionStatement(state.curToken);

    let expr = parseExpression(Precedence.LOWEST);

    if (!expr) { return null; }

    stmt.expression = expr;

    return stmt;
  }

  function parseExpression(precedence: Precedence): ExpressionNode | null  {
    if (state.curToken == undefined) return null;
    let prefix = prefixParseFnMap.get(state.curToken?.type);

    if (!prefix) { 
      return null; 
    }

    let left = prefix();


    // 3 + 2
    //   c p
    // l

    while (!peekTokenIs(token.SEMICOLON) && precedence < peekPredence()) {
      let infix = infixParseFnMap.get(state.peekToken?.type as any);
      if (!infix) {
        return left;
      }

      // DEFINED HERE BECAUSE TYPESCRIPT IS COMPLAINING
      if (!left) { return null; }

      nextToken();

      left = infix(left);

    }

    return left;
  }

  function parseIntegerLiteral(): IntegerExpression | null {
    let stmt = new IntegerExpression(state.curToken);
    let parsedNum = parseInt(state.curToken?.literal || "");
    if (!parsedNum) { 
      pushError(`Expected INT, got ${state.curToken?.type}`)
      return null; 
    }
    stmt.value = parsedNum;
    return stmt;
  }

  function parsePrefixExpression(): PrefixExpression | null {
    let stmt = new PrefixExpression(state.curToken, state.curToken?.literal);
    nextToken();
    let right = parseExpression(Precedence.PREFIX);
    if (!right) { return null; }
    stmt.right = right;
    return stmt;
  }

  function parseInfixExpression(left: ExpressionNode): PrefixExpression | null {
    let stmt = new InfixExpression(state.curToken, left, state.curToken?.literal);

    // 5 + 2
    //   c p
    // store the current operator's precedence
    // advance token. Next iteration, peedPrecedence will contain the
    // next infix operator

    const precedence = curPredence();
    nextToken();

    let right = parseExpression(precedence);
    if (!right) { return null; }
    stmt.right = right;
    return stmt;
  }

  function parseGroupExpression(): ExpressionNode | null {
    // ( A + B )
    //   c p
    nextToken();

    let exprs = parseExpression(Precedence.LOWEST);

    if (!exprs) { return null; }

    if (!expectPeek(token.RPAREN)) {
      return null;
    }

    return exprs; 
  }

  function expectPeek(type: token.TokenType): boolean  {
    if (state.peekToken?.type == type) {
      nextToken();
      return true;
    }
    expectError(type);
    return false;
  }

  function expectError(type: token.TokenType) {
    state.errors.push(`expected token to be '${type}', got '${state.peekToken?.type}' instead`)
  }

  function currentTokenIs(type: token.TokenType): boolean  {
    return state.curToken?.type == type
  }

  function peekTokenIs(type: token.TokenType): boolean  {
    return state.peekToken?.type == type
  }

  function curPredence(): Precedence {
    if (state.curToken == undefined || !state.curToken.type) { return Precedence.LOWEST }

    if (precedences.has(state.curToken?.type)) {
      let p: Precedence | undefined = precedences.get(state.curToken?.type);
      return p ? p : Precedence.LOWEST;
    }

    return Precedence.LOWEST;
  }

  function peekPredence(): Precedence {
    if (state.peekToken == undefined || !state.peekToken.type) { return Precedence.LOWEST }

    if (precedences.has(state.peekToken?.type)) {
      let p: Precedence | undefined = precedences.get(state.peekToken?.type);
      return p ? p : Precedence.LOWEST;
    }

    return Precedence.LOWEST;
  }

  function pushError(what: string) {
    state.errors.push(what);
  }

  return {
    state,
    parseProgram,
  };
}