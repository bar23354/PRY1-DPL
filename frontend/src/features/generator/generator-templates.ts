export const GENERATOR_TEMPLATES = {
  "generator-low": `(* Complejidad baja *)

let delimitador = [' ''\\t''\\n']
let espacioEnBlanco = delimitador+
let digito = ['0'-'9']
let numero = '-'?digito+
let letra = ['a'-'z''A'-'Z']
let identificador = letra(letra|digito)*

rule tokens =
  espacioEnBlanco {}
| identificador { return IDENT }
| numero { return NUM }
| '+' { return PLUS }
| '*' { return TIMES }
| '=' { return ASSIGN }
`,
  "generator-medium": `(* Complejidad media *)

let delimitador = [' ''\\t''\\n']
let ws = delimitador+
let digito = ['0'-'9']
let letra = ['a'-'z''A'-'Z''_']
let identificador = letra(letra|digito)*
let entero = digito+
let relop = "=="|">="|"<="|"!="|">"|"<"
let stringSimple = '"' letra+ '"'

rule tokens =
  ws {}
| "if" { return IF }
| "else" { return ELSE }
| "while" { return WHILE }
| relop { return RELOP }
| stringSimple { return STRING }
| entero { return INT }
| identificador { return ID }
| '=' { return ASSIGN }
| '+' { return PLUS }
| '-' { return MINUS }
`,
  "generator-high": `(* Complejidad alta, no exhaustiva *)

let ws = [' ''\\t''\\n']+
let digit = ['0'-'9']
let lower = ['a'-'z']
let upper = ['A'-'Z']
let letter = lower|upper|'_'
let id = letter(letter|digit)*
let int = digit+
let frac = '.'digit+
let number = int(frac)?
let rel = "=="|"!="|">="|"<="|">"|"<"
let addop = '+'|'-'
let mulop = '*'|'/'
let logic = "&&"|"||"

rule tokens =
  ws {}
| "if" { return IF }
| "else" { return ELSE }
| "while" { return WHILE }
| "return" { return RETURN }
| "int" { return KW_INT }
| "float" { return KW_FLOAT }
| "bool" { return KW_BOOL }
| number { return NUMBER }
| id { return ID }
| rel { return RELOP }
| logic { return LOGICOP }
| addop { return ADDOP }
| mulop { return MULOP }
| '=' { return ASSIGN }
| ';' { return SEMI }
| ',' { return COMMA }
| '(' { return LPAREN }
| ')' { return RPAREN }
| '{' { return LBRACE }
| '}' { return RBRACE }
`,
  "generator-full-features": `{
TOKEN_INT = "TOKEN_INT"
}
let vocal = [aeiou]
let minus = [a-z]
let consonante = minus # vocal
let dig = ['0'-'9']
rule main [mode] =
  [' ''\\t''\\n']+ {
    skip
  }
| consonante+ { return "CONS" }
| [^a-z]+ { return "NOLOWER" }
| _ { return "ANY" }
| dig+ {
    val = int(lexeme)
    return TOKEN_INT
  }
| eof { return "EOF" }
`,
} as const;

export type GeneratorTemplateId = keyof typeof GENERATOR_TEMPLATES;
