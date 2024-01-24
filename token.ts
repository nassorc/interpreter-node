export type TokenType = string;

export type Token = {
  type: TokenType
  literal: string
}

export function Token(tk?: {type?: TokenType, literal?: string}) {
  if (tk) {
    this.type = tk.type;
    this.literal = tk.literal;
  }
}

export const PLUS = "+"
    , MINUS = "-"
    , ASTERISK = "*"
    , SLASH = "/"
    , ASSIGN = "="
    , LPAREN = "("
    , RPAREN = ")"
    , LBRACE = "{"
    , RBRACE = "}"
    , LET = "LET"
    , INT = "INT"
    , IDENTIFIER = "IDENTIFIER"
    , SEMICOLON = ";"
    , EOF = "EOF";

const keywordMap = new Map<string, TokenType>();
keywordMap.set("let", LET);


export function getIdentifier(identifier: string): TokenType {
  // console.log("getting identifier");
  // console.log("identifier", identifier)
  // keywordMap.has()
  if (keywordMap.has(identifier)) {
    return keywordMap.get(identifier) || IDENTIFIER;
  }
  return IDENTIFIER;
}


// class Token {
//   public type: TokenType | undefined;
//   public literal: string | undefined;

//   constructor(tk?: {type?: TokenType, literal?: string}) {
//     if (tk) {
//       this.type = tk.type;
//       this.literal = tk.literal;
//     }
//   }
// }

