import { createLexer } from "./lexer";
import { createParser } from "./parser";
import * as token from "./token";
import { StatementNode, LetStatement } from "./ast";

// let statements: StatementNode[] = [];
// let l1 = new LetStatement();
// statements.push(l1);

// for (const stmt of statements) {
//   console.log(stmt.toString())
// }
// const lexer = createLexer({ 
//   input: `let a = 10;
//   let b = 20;` 
// });

// // let tk = lexer.nextToken();

// // while (tk.type != token.EOF) {
// //   console.log(tk)
// //   tk = lexer.nextToken();
// // }

// const parser = createParser(lexer);
// const program = parser.parseProgram();
// console.log(program.statements)
// console.log(parser.state.errors);

// console.log("state: ", parser.state)

const lexer = createLexer({ 
  input: `-5 + 10 * 15;` 
});

// let tk = lexer.nextToken();

// while (tk.type != token.EOF) {
//   console.log(tk)
//   tk = lexer.nextToken();
// }

const parser = createParser(lexer);
const program = parser.parseProgram();
console.log(program.toString());
// console.dir(program.statements, { depth: Infinity })
// console.log(parser.state.errors);