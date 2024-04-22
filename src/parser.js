import {Keywords, Token, TokenType} from "./tokens.js";
import {
    CallExpr,
    DefineExpr,
    IfExpr,
    LambdaExpr,
    LiteralExpr,
    NULL_VALUE,
    SymbolExpr,
    ListExpr,
    QuoteExpr, SetExpr, BeginExpr, ImportExpr
} from "./expressions.js";
import {SyntaxError} from "./errors.js";

export class Parser {

    current = 0;

    /**
     * @param {Token[]} tokens
     * */
    constructor(tokens) {
        this.tokens = tokens;
    }

    parse() {
        const expressions = [];
        while (!this.isEnd()) {
            expressions.push(this.expression());
        }
        return expressions;
    }

    expression() {
        if (this.match(TokenType.LeftBracket)) {
            if (this.match(TokenType.RightBracket)) {
                throw new SyntaxError(`Unexpected syntax in form () [${this.previous().line}:${this.previous().position}]`);
            }

            const token = this.peek();
            if (token.lexeme === Keywords.Define) {
                return this.define();
            }
            if (token.lexeme === Keywords.Lambda) {
                return this.lambda();
            }
            if (token.lexeme === Keywords.Set) {
                return this.set();
            }
            if (token.lexeme === Keywords.If) {
                return this.if();
            }
            if (token.lexeme === Keywords.Quote) {
                return this.quote();
            }
            if (token.lexeme === Keywords.Begin) {
                return this.begin();
            }
            if (token.lexeme === Keywords.Import) {
                // console.log(this.peek());
                this.advance();
                // console.log(this.peek());
                const value = this.expression();
                // console.log(this.peek());
                this.advance();
                return new ImportExpr(value);
            }
            return this.call();
        }
        return this.atom()
    }

    begin() {
        this.advance();
        let expr = [];
        while (!this.match(TokenType.RightBracket)){
            expr.push(this.expression());
        }
        return new BeginExpr(expr);
    }

    if() {
        this.advance();
        const condition = this.expression();
        const trueExpr = this.expression();
        let falseExpr;
        if (!this.match(TokenType.RightBracket) || this.match(TokenType.LeftBracket)) {
            falseExpr = this.expression();
        }
        if (falseExpr) {
            this.advance();
        }
        return new IfExpr(condition, trueExpr, falseExpr);
    }

    call() {
        const called = this.expression();

        if (called.token.tokenType !== TokenType.Symbol) {
            throw new SyntaxError(`Unexpected token [${called.token.line}:${called.token.position}] ${called.token.literal}`);
        }

        const args = [];

        while (!this.match(TokenType.RightBracket)) {
            args.push(this.expression());
        }

        return new CallExpr(called, args);
    }

    set() {
        this.advance();
        let name;
        if (this.peek().tokenType === TokenType.Symbol) {
            name = this.advance();
        }
        else {
            throw new SyntaxError(`Unexpected token`);
        }
        const value = this.expression();
        if (this.peek().tokenType === TokenType.RightBracket) {
            this.advance();
        }
        else {
            throw new SyntaxError(`Unexpected token`);
        }
        return new SetExpr(name, value);
    }

    quote() {
        this.advance();

        const value = this.quoteValue();

        if (this.peek().tokenType === TokenType.RightBracket) {
            this.advance();
        } else {
            throw new SyntaxError();
        }

        return new QuoteExpr(value);
    }

    quoteValue() {
        let quoted;

        if (this.match(TokenType.LeftBracket)) {
            const args = [];

            while (!this.match(TokenType.RightBracket)) {
                const params = this.expression();
                args.push(params);
            }

            quoted = new ListExpr(args);
        } else {
            quoted = this.expression();
        }

        return quoted;
    }

    define() {
        this.advance();
        const variable = this.advance();

        if (variable.tokenType !== TokenType.Symbol) {
            throw new SyntaxError(`Unexpected name [${variable.line}:${variable.position}] ${variable.lexeme}`)
        }

        let expr;

        try {
            expr = this.expression();
        } catch {
            expr = undefined;
        }

        if (!this.match(TokenType.RightBracket)) {
            throw new SyntaxError(`Unexpected EOF`);
        }
        return new DefineExpr(variable, expr);
    }

    lambda() {
        this.advance();

        const args = [];
        if (this.match(TokenType.Symbol)) {
            args.push(this.previous());
        } else {
            if (!this.match(TokenType.LeftBracket)) {
                throw new SyntaxError();
            }
            while (!this.match(TokenType.RightBracket)) {
                if (!this.match(TokenType.Symbol)) {
                    throw new SyntaxError(`Invalid list of argument [${this.peek().line}:${this.peek().position}]: ${this.peek().lexeme}`);
                }
                if (args.find(arg => arg.lexeme === this.previous().lexeme)) {
                    throw new SyntaxError(`Duplicate identifier in argument list [${this.previous().line}:${this.previous().position}]: ${this.previous().lexeme}`);
                }
                args.push(this.previous());
            }
        }
        const body = [];
        while (!this.match(TokenType.RightBracket)) {
            body.push(this.expression());
        }
        return new LambdaExpr(args, body);
    }

    atom() {
        switch (true) {
            case this.match(TokenType.Symbol):
                return new SymbolExpr(this.previous());
            case this.match(TokenType.Boolean):
            case this.match(TokenType.String):
            case this.match(TokenType.Number):
                return new LiteralExpr(this.previous());
            default:
                throw new SyntaxError(`Unexpected EOF`);
        }
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    advance() {
        return this.tokens[this.current++];
    }

    match(tokenType) {
        if (this.peek().tokenType === tokenType) {
            this.current++;
            return true;
        }
        return false;
    }

    peek() {
        return this.tokens[this.current];
    }

    isEnd() {
        return this.peek().tokenType === TokenType.Eof;
    }
}