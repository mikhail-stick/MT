import {Tokenizer} from "./tokenizer.js";
import {Parser} from "./parser.js";
import {Interpreter} from "./interpreter.js";
import fs from 'fs';
import {Token, TokenType} from "./tokens.js";
import {CallExpr, DefineExpr, IfExpr, LambdaExpr, ListExpr, LiteralExpr, QuoteExpr, SymbolExpr} from "./expressions.js";

export const run = (code) => {
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();

    // Table of identificators
    let str = "";
    for (const token of tokens) {
        if (token.tokenType === TokenType.LeftBracket || token.tokenType === TokenType.RightBracket) {
            str += token.lexeme;
        }
        if (token.tokenType === TokenType.Symbol) {
            str += token.lexeme + " ";
        }
        if ([TokenType.String, TokenType.Boolean, TokenType.Number].includes(token.tokenType)) {
            const i = tokens.findIndex((tok) => tok.lexeme === token.lexeme);
            str += `<id${i}>`;
        }
    }
    // console.log(str);
    // console.table(tokens);

    const parser = new Parser(tokens);
    const expressions = parser.parse();

    // constructTree(expressions);

    const interpreter = new Interpreter(expressions);

    return interpreter.interpret();
}

const constructTree = function(expr, indent = '|- ') {
    if (Array.isArray(expr)) {
        for (const prop of expr) {
            if (prop instanceof DefineExpr) {
                console.log(indent + "Define");
                constructTreze(prop.variable, '  ' + indent);
                constructTree(prop.value, '  ' + indent);
                continue;
            }
            if (prop instanceof CallExpr) {
                console.log(indent + "Call");
                constructTree(prop.called, '  ' + indent);
                constructTree(prop.args, '  ' + indent);
                continue;
            }
            if (prop instanceof IfExpr) {
                console.log(indent + 'If');
                constructTree(prop.condition, '  ' + indent);
                constructTree(prop.trueExpr, '  ' + indent);
                constructTree(prop.falseExpr, '  ' + indent);
                continue
            }
            if (prop instanceof LambdaExpr) {
                console.log(indent + 'Lambda');
                constructTree(prop.args, '  ' + indent);
                constructTree(prop.body, '  ' + indent);
                continue;
            }
            if (prop instanceof QuoteExpr) {
                console.log(indent + 'Quote');
                constructTree(prop.value, '  ' + indent);
                continue;
            }
            if (prop instanceof ListExpr) {
                console.log(indent + 'List');
                constructTree(prop.items, '  ' + indent);
                continue;
            }
            if (prop instanceof LiteralExpr) {
                console.log(indent + prop.token.literal);
                continue;
            }
            if (prop instanceof Token) {
                console.log(indent + prop.literal);
                continue;
            }
            if (prop instanceof SymbolExpr) {
                console.log(indent + prop.token.literal);
                continue;
            }
            constructTree(prop, '  ' + indent);
        }
    }
    if (expr instanceof CallExpr) {
        console.log(indent + "Call");
        constructTree(expr.called, '  ' + indent);
        constructTree(expr.args, '  ' + indent);
    }
    if (expr instanceof LiteralExpr) {
        console.log(indent + expr.token.literal);
    }
    if (expr instanceof IfExpr) {
        console.log(indent + 'If');
        constructTree(expr.condition, '  ' + indent);
        constructTree(expr.trueExpr, '  ' + indent);
        constructTree(expr.falseExpr, '  ' + indent);
    }
    if (expr instanceof LambdaExpr) {
        console.log(indent + 'Lambda');
        constructTree(expr.args, '  ' + indent);
        constructTree(expr.body, '  ' + indent);
    }
    if (expr instanceof QuoteExpr) {
        console.log(indent + 'Quote');
        constructTree(expr.value, '  ' + indent);
    }
    if (expr instanceof ListExpr) {
        console.log(indent + 'List');
        constructTree(expr.items, '  ' + indent);
    }
    if (expr instanceof Token) {
        console.log(indent + expr.literal);
    }
    if (expr instanceof SymbolExpr) {
        console.log(indent + expr.token.literal);
    }
}

const file = fs.readFileSync("./src/INPUT.txt", "utf-8");
run(file);
console.log();

// run(`(define x #t)
//
// (display x)`)
//
// run(`
// (define x 25)
// (if (< x 10)
//     (display "x меньше 10")
//     (if (> x 20)
//         (display "x больше 20")
//         (display "x между 10 и 20")))
//         `)
//
// run(`(define factorial(lambda (n) (define a 1) (+ n a)))
// (display (factorial (factorial (factorial (+ 1 1)))))
// (display (factorial 1))`);
//
// run(`(define a (+ 1 (+ 1 1)))
// (display a)`)

// run(`
// (define factorial
//   (lambda (n)
//     (if (= n 0)
//         1
//         (* n (factorial (- n 1))))))
//
// (display (factorial 5))
// `);


// (define i 0)
// (define j 0)
// (define k 0)
//
// (define count_value (lambda (f_row f_col A s_row s_col B C)
// (define temp (+ (vector-ref (vector-ref C i) j) (* (vector-ref (vector-ref A i) k) (vector-ref (vector-ref B k) j))))
// (vector-set! (vector-ref C i) j temp)
// (set! k (+ k 1))
// (multiply_matrix_rec f_row f_col A s_row s_col B C)
// )
// )
//
// (define next_row (lambda (f_row f_col A s_row s_col B C)
// (set! k 0)
// (set! j (+ j 1))
// (multiply_matrix_rec f_row f_col A s_row s_col B C)
// )
// )
//
// (define calculate (lambda (f_row f_col A s_row s_col B C)
// (set! j 0)
// (set! i (+ i 1))
// (multiply_matrix_rec f_row f_col A s_row s_col B C)
// )
// )
//
// (define matr (lambda (C)
// C
// )
// )
//
// (define multiply_matrix_rec (lambda (f_row f_col A s_row s_col B C)
// (
// if (>= i f_row)
// 0
// (matr C)
// )
//
// (
// if (< j s_col)
// (
// if (< k f_col)
// (count_value f_row f_col A s_row s_col B C)
// (+ 0 0)
// )
// (+ 0 0)
// (next_row f_row f_col A s_row s_col B C)
// )
//
// ;(calculate f_row f_col A s_row s_col B C)
//
// C
// )
// )
//
// (define multiply_matrix (lambda (f_row f_col f_m s_row s_col s_m)
// (
// if (not (= s_row f_col))
// "not possible"
// (multiply_matrix_rec f_row f_col f_m s_row s_col s_m (quote ((quote (0 0)) (quote (0 0)))))
// )
// )
// )
//
// (define first_matrix (quote ((quote (1 2 3))
// (quote (4 5 6))
// (quote (7 8 9)))))
// (define second_matrix (quote ((quote (1 2 3))
// (quote (4 5 6))
// (quote (7 8 9)))))
//
// ;(vector-set! (vector-ref first_matrix 0) 0 35)
// ;(display first_matrix)
// (display (multiply_matrix 2 3 first_matrix 3 2 second_matrix))
//
// ; (define factorial
// ;   (lambda (n)
// ;     (if (= n 0)
// ;         1
// ;         (* n (factorial (- n 1))))))
// ;
// ;(display (factorial 5))