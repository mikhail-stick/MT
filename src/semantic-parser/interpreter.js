import {
    BeginExpr,
    CallExpr,
    DefineExpr,
    IfExpr, ImportExpr,
    LambdaExpr,
    ListExpr,
    LiteralExpr,
    QuoteExpr, ReturnExpr,
    SetExpr,
    SymbolExpr
} from "../syntactic-parser/expressions.js";
import {Environment} from "./environment.js";
import {RuntimeError, SemanticError} from "../errors.js";
import fs from "fs";
import path from "path";
import {Tokenizer} from "../lexical-parser/tokenizer.js";
import {Parser} from "../syntactic-parser/parser.js";

export class Interpreter {
    /**
     * @param {Expr[]} expressions
     * */
    constructor(expressions) {
        this.expressions = expressions;
        this.env = new Environment();
        this.importedFiles = [];

        this.env.define("set!", function (key, value) {
            this.env.set(key, value);
        })

        this.env.define("+", function (...args) {
            args.map((value) => {
                if (typeof value !== "number") {
                    throw new SemanticError(`In procedure '+' Wrong type "${value}"`);
                }
            })

            return args.reduce(function (x, y) {
                return x + y;
            }, 0);
        });
        this.env.get('+').isSpread = true;

        this.env.define("-", function (...args) {
            args.map((value) => {
                if (typeof value !== "number") {
                    throw new SemanticError(`In procedure '-' Wrong type "${value}"`);
                }
            })

            let res = args[0];
            for (let i = 1; i < args.length; i++) {
                res -= args[i];
            }
            return res;
        });
        this.env.get('-').isSpread = true;

        this.env.define("/", function (...args) {
            args.map((value) => {
                if (typeof value !== "number") {
                    throw new SemanticError(`In procedure '/' Wrong type "${value}"`);
                }
            })

            let res = args[0];
            for (let i = 1; i < args.length; i++) {
                res /= args[i];
            }
            return res;
        });
        this.env.get('/').isSpread = true;

        this.env.define("*", function (...args) {
            args.map((value) => {
                if (typeof value !== "number") {
                    throw new SemanticError(`In procedure '/' Wrong type "${value}"`);
                }
            })

            let res = args[0];
            for (let i = 1; i < args.length; i++) {
                res *= args[i];
            }
            return res;
        });
        this.env.get('*').isSpread = true;

        this.env.define("=", function (a, b) {
            if (typeof a !== "number") {
                throw new SemanticError(`In procedure '=' Wrong type "${a}"`);
            }
            if (typeof b !== "number") {
                throw new SemanticError(`In procedure '=' Wrong type "${b}"`);
            }
            return a === b;
        });
        this.env.define(">", function (a, b) {
            if (typeof a !== "number") {
                throw new SemanticError(`In procedure '=' Wrong type "${a}"`);
            }
            if (typeof b !== "number") {
                throw new SemanticError(`In procedure '=' Wrong type "${b}"`);
            }
            return a === b;
        });
        this.env.define("<", function (a, b) {
            if (typeof a !== "number") {
                throw new SemanticError(`In procedure '<' Wrong type "${a}"`);
            }
            if (typeof b !== "number") {
                throw new SemanticError(`In procedure '<' Wrong type "${b}"`);
            }
            return a < b;
        });
        this.env.define(">=", function (a, b) {
            if (typeof a !== "number") {
                throw new SemanticError(`In procedure '>=' Wrong type "${a}"`);
            }
            if (typeof b !== "number") {
                throw new SemanticError(`In procedure '>=' Wrong type "${b}"`);
            }
            return a >= b;
        });
        this.env.define("<=", function (a, b) {
            if (typeof a !== "number") {
                throw new SemanticError(`In procedure '<=' Wrong type "${a}"`);
            }
            if (typeof b !== "number") {
                throw new SemanticError(`In procedure '<=' Wrong type "${b}"`);
            }
            return a <= b;
        });
        this.env.define("min", function (a, b) {
            if (typeof a !== "number") {
                throw new SemanticError(`In procedure 'min' Wrong type "${a}"`);
            }
            if (typeof b !== "number") {
                throw new SemanticError(`In procedure 'min' Wrong type "${b}"`);
            }
            return Math.min(a, b);
        });
        this.env.define("max", function (a, b) {
            if (typeof a !== "number") {
                throw new SemanticError(`In procedure 'max' Wrong type "${a}"`);
            }
            if (typeof b !== "number") {
                throw new SemanticError(`In procedure 'max' Wrong type "${b}"`);
            }
            return Math.max(a, b);
        });
        this.env.define("abs", (arg) => {
            if (typeof arg !== "number") {
                throw new SemanticError(`In procedure 'abs' Wrong type "${arg}"`);
            }
            return Math.abs(arg);
        });
        this.env.define("sqrt", (arg) => {
            if (typeof arg !== "number") {
                throw new SemanticError(`In procedure 'sqrt' Wrong type "${arg}"`);
            }
            return Math.sqrt(arg);
        });
        this.env.define("expt", (arg) => {
            if (typeof arg !== "number") {
                throw new SemanticError(`In procedure 'expt' Wrong type "${arg}"`);
            }
            return Math.exp(arg);
        });
        this.env.define("sin", (arg) => {
            if (typeof arg !== "number") {
                throw new SemanticError(`In procedure 'sin' Wrong type "${arg}"`);
            }
            return Math.sin(arg);
        });
        this.env.define("cos", (arg) => {
            if (typeof arg !== "number") {
                throw new SemanticError(`In procedure 'cos' Wrong type "${arg}"`);
            }
            return Math.cos(arg);
        });
        this.env.define("log", (arg) => {
            if (typeof arg !== "number") {
                throw new SemanticError(`In procedure 'log' Wrong type "${arg}"`);
            }
            return Math.log(arg);
        });
        this.env.define("not", (arg) => {
            if (typeof arg !== "boolean") {
                return false
            }
            return !arg;
        });
        this.env.define("display", (arg) => {
            process.stdout.write(this.toLispTypes(arg));
            return undefined;
        });
        this.env.define("displayln", (arg) => console.log(this.toLispTypes(arg)));

        this.env.define("null?", (arg) => {
            return JSON.stringify(arg) === JSON.stringify([]);
        });
        this.env.define("number?", (arg) => typeof arg === "number");
        this.env.define("boolean?", (arg) => typeof arg === "boolean");
        this.env.define("string?", (arg) => typeof arg === "string");
        this.env.define("list?", (arg) => Array.isArray(arg));
        this.env.define("length", (arg) => {
            if (!Array.isArray(arg)) {
                throw new SemanticError(`In procedure 'length' Wrong type "${arg}"`);
            }
            return arg.length;
        })
        this.env.define("string-append", function (str1, str2) {
            if (typeof str1 !== "string") {
                throw new SemanticError(`In procedure 'string-append' Wrong type "${str1}"`);
            }
            if (typeof str2 !== "string") {
                throw new SemanticError(`In procedure 'string-append' Wrong type "${str2}"`);
            }
            return str1 + str2;
        });
        this.env.define('quote', ([arg]) => arg);
        this.env.define('car', (arg) => {
            if (!Array.isArray(arg)) {
                throw new SemanticError(`In procedure 'car' Wrong type "${arg}"`);
            }
            return arg[0];
        });
        this.env.define('cdr', (arg) => {
            if (!Array.isArray(arg)) {
                throw new SemanticError(`In procedure 'cdr' Wrong type "${arg}"`);
            }
            return arg.slice(1);
        });
        this.env.define('vector-ref', function (list, index) {
            if (index % 1 !== 0) {
                throw new SemanticError(`In procedure 'vector-ref' Wrong type "${index}"`);
            }
            if (index > list.length - 1) {
                throw new SemanticError();
            }
            return list[index];
        });
        this.env.define('vector-set!', function (list, index, value) {
            if (index % 1 !== 0) {
                throw new SemanticError(`In procedure 'vector-set!' Wrong type "${index}"`);
            }
            if (index > list.length - 1) {
                throw new SemanticError();
            }
            list[index] = value;
            return list;
        });
        this.env.define('make-list', function (size, value) {
            if (typeof value !== "object") {
                return new Array(size).fill(value);
            }
            return Array.from({ length: size }, () => value.slice());
        })
        this.env.define('number->string', function (arg) {
            if (typeof arg !== 'number') {
                throw new SemanticError(`In procedure 'number->string' Wrong type "${arg}"`);
            }
            return `${arg}`;
        })
        this.env.define('sort', (compareFunc, arr) => {
            return arr.sort((a, b) => {
                return this.makeCompare(compareFunc, a, b)
            });
        })
        this.env.define('string=?', function (...args) {
            return args.every((value) => value === args[0]);
        })
        this.env.get('string=?').spread = true;

        this.env.define('string<?', (str1, str2) => {
            return str1 < str2;
        })


    }

    makeCompare(compareFunc, a, b) {
        const res = compareFunc(a, b);
        if (res === true) {
            return -1;
        }
        return 1;
    }

    interpret(expressions, env) {
        let result;
        expressions = expressions || this.expressions;
        // console.log(expressions)
        for (const expr of expressions) {
            // console.log(expr)
            result = this.interpretExpr(expr, env || this.env);
        }
        // console.log(this.env);
        return this.toLispTypes(result);
    }

    toLispTypes(arg) {
        if (typeof arg === "boolean") {
            return arg ? "#t" : "#f";
        }
        if (typeof arg === "string") {
            return arg.replace(/\\(.)/g, function (match, char) {
                if (char === 'n') {
                    return '\n';
                } else {
                    return match;
                }
            });
        }
        if (Array.isArray(arg)) {
            return `(${arg.map(this.toLispTypes.bind(this)).join(' ')})`;
        }
        if (typeof arg === 'undefined') {
            return 'unspecified'
        }
        if (typeof arg === 'function') {
            return `procedure ${this.env.getKeyByValue(arg)}`
        }
        if (arg instanceof Procedure) {
            return `procedure ${this.env.getKeyByValue(arg)}`;
        }
        return arg.toString();
    }

    /**
     * @param {Expr} expr
     * @param {Environment} env
     * */
    interpretExpr(expr, env) {
        if (expr instanceof CallExpr) {
            const called = this.interpretExpr(expr.called, env);
            const args = expr.args.map((arg) => this.interpretExpr(arg, env));

            if (called instanceof Procedure) {
                if (called.args.length !== args.length && !called.isSpread) {
                    throw new SemanticError(`Wrong number of arguments in ${expr.called.token.literal} (it takes ${called.args.length} arguments, but ${args.length} are received)`);
                }
                return called.call(this, args);
            }

            if (called.length !== args.length && !called.isSpread) {
                throw new SemanticError(`Wrong number of arguments in ${expr.called.token.literal} (it takes ${called.length} arguments, but ${args.length} are received)`);
            }

            return called(...args);
        }
        if (expr instanceof DefineExpr) {
            return env.define(expr.variable.lexeme, this.interpretExpr(expr.value, env));
        }
        if (expr instanceof LambdaExpr) {
            return new Procedure(expr.args, expr.body, expr.isSpread, env);
        }
        if (expr instanceof LiteralExpr) {
            return expr.token.literal;
        }
        if (expr instanceof SymbolExpr) {
            return env.get(expr.token.lexeme);
        }
        if (expr instanceof SetExpr) {
            return env.set(expr.name.lexeme, this.interpretExpr(expr.value, env));
        }
        if (expr instanceof QuoteExpr) {
            return this.interpretExpr(expr.value, env);
        }
        if (expr instanceof ListExpr) {
            return expr.items.map((value) => this.interpretExpr(value, env));
        }
        if (expr instanceof IfExpr) {
            if (this.interpretExpr(expr.condition, env)) {
                return this.interpretExpr(expr.trueExpr, env);
            } else {
                return this.interpretExpr(expr.falseExpr, env);
            }
        }
        if (expr instanceof BeginExpr) {
            return this.interpret(expr.expression, env);
        }
        if (expr instanceof ImportExpr) {
            const filePath = path.join(path.dirname(path.dirname(import.meta.url)), expr.value.token.literal).split(':')[1];

            if (path.extname(filePath) === '.scm') {
                return this.importIfExistAndNotImported(filePath, env);
            }

            if (path.extname(filePath) === '') {
                const filePathWithExt = path.join(filePath + '.scm');
                return this.importIfExistAndNotImported(filePathWithExt, env);
            }

            throw new RuntimeError(`Cannot import file: ${filePath}`);
        }
        if (expr instanceof ReturnExpr) {
            return this.interpretExpr(expr.value, env);
        }
    }

    isImported(filePath) {
        return this.importedFiles.some((root) => {
            if (root === path.resolve(filePath)) {
                return true;
            }
        })
    }

    importIfExistAndNotImported(filePath, env) {
        const isFileExist = fs.existsSync(filePath);

        if (isFileExist) {
            return this.importIfNotImported(filePath, env);
        } else {
            throw new RuntimeError(`Cannot import file: ${filePath}`);
        }
    }

    importIfNotImported(filePath, env) {
        if (this.isImported(filePath)) {
            return;
        }

        this.importedFiles.push(path.resolve(filePath));

        this.importFile(filePath, env)
    }

    importFile(filePath, env) {
        const file = fs.readFileSync(filePath).toString();

        const tokenizer = new Tokenizer(file);
        const tokens = tokenizer.tokenize();

        const parser = new Parser(tokens);
        const expressions = parser.parse();

        return this.interpret(expressions, env);
    }
}

class Procedure {
    /**
     * @param{Token[]} args
     * @param{Expr[]} body
     * @param{Boolean} isSpread
     * @param{Environment} env
     * */
    constructor(args, body, isSpread, env) {
        this.args = args;
        this.body = body;
        this.isSpread = isSpread;
        this.env = env;
    }

    call(interpreter, args) {
        if (this.isSpread) {
            args = [args];
        }
        const env = new Environment(this.env, this.args, args);
        let result;
        for (const expr of this.body) {
            result = interpreter.interpretExpr(expr, env);
            if (expr instanceof ReturnExpr) {
                break;
            }
        }
        return result;
    }
}