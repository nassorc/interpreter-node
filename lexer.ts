import { type Token } from "./token";
import * as token from "./token";

export type Lexer = ReturnType<typeof createLexer>;
export function createLexer(config: { input: string }){
  let state: { input: string, ch: string, readPosition: number, position: number} = {
    input: config.input,
    ch: "\0",
    position: 0,
    readPosition: 0,
  }

  readChar();

  function nextToken(): Token {
    let tk;

    skipWhitespace();

    switch(state.ch) {
      case "+":
        tk = newToken(token.PLUS, state.ch);
        break;
      case "-":
        tk = newToken(token.MINUS, state.ch);
        break;
      case "*":
        tk = newToken(token.ASTERISK, state.ch);
        break;
      case "/":
        tk = newToken(token.SLASH, state.ch);
        break;
      case "=":
        tk = newToken(token.ASSIGN, state.ch);
        break;
      case ";":
        tk = newToken(token.SEMICOLON, state.ch);
        break;
      default:
        if (isLetter()) {
          let identifier = readIdentifier();
          tk = newToken(token.getIdentifier(identifier), identifier);
          return tk; // early return due to readIdentifier having side effects on state
        } else if (isDigit()) {
          let num = readNumber();
          tk = newToken(token.INT, num);
          return tk;
        }
        tk = newToken(token.EOF, "");
        break;
    }
    readChar();
    return tk;
  }

  function readChar () {
    if (state.readPosition >= state.input.length) {
      state.ch = "\0";
    } else {
      state.ch = state.input[state.readPosition];
    }

    state.position = state.readPosition;
    state.readPosition += 1;
  }

   function newToken(type: token.TokenType, literal: string) {
    return new token.Token({type, literal})
  }

  function isLetter() {
    return state.ch.toLowerCase() != state.ch.toUpperCase() || state.ch == "_";
  }

   function isDigit() {
    return !isNaN(parseInt(state.ch));
  }

   function skipWhitespace() {
    while(state.ch == " " || state.ch == "\n" || state.ch == "\t" || state.ch == "\r") {
      readChar();
    }
  }

  function readIdentifier () {
    let spos = state.position;
    while(isLetter())  {
      readChar();
    }
    return state.input.slice(spos, state.position)
  }

  function readNumber () {
    let spos = state.position;

    while(isDigit())  {
      readChar();
    }
    return state.input.slice(spos, state.position)
  }

  return {
    state,
    nextToken
  }
}