import {TokenType, Token} from "./tokens.js";
import {LexicalError} from "./errors.js";

export class Tokenizer {

    start = 0;
    current = 0;
    line = 1;
    line_position = 0;
    /**
     * @type Token[]
     * */
    tokens = [];

    /**
     * @param {string} code
     */
    constructor(code) {
        this.code = code
    }

    tokenize() {
        while (!this.isEnd()) {
            this.start = this.current;
            const char = this.advance();

            switch (char) {
                case "(": {
                    this.addToken(TokenType.LeftBracket, null);
                    break;
                }
                case ")": {
                    this.addToken(TokenType.RightBracket, null);
                    break;
                }
                case ';':
                    while(this.peek() !== '\n' && !this.isEnd()){
                        this.advance();
                    }
                    this.advance();
                    this.line += 1;
                    this.line_position = this.current - 1;
                    break;
                case ' ':
                case '\r':
                case '\t':
                    break;
                case "\n": {
                    this.line += 1;
                    this.line_position = this.start + 1;
                    break;
                }
                case '"': {
                    while (this.peek() !== '"' && !this.isEnd()) {
                        this.advance();
                    }
                    if (this.isEnd()) {
                        throw new LexicalError(`Unclosed string [${this.line}:${this.start - this.line_position + 1}]`);
                    }
                    this.advance();
                    this.addToken(TokenType.String, this.code.slice(this.start + 1, this.current - 1))
                    break;
                }
                case "#": {
                    if (this.peek() === "t") {
                        this.advance();
                        if ([" ", "(", ")", "\n", undefined].includes(this.peek())) {
                            this.addToken(TokenType.Boolean, true);
                            break;
                        }
                    }
                    if (this.peek() === "f") {
                        this.advance();
                        if ([" ", "(", ")", "\n", undefined].includes(this.peek())) {
                            this.addToken(TokenType.Boolean, false);
                            break;
                        }
                        this.addToken(TokenType.Boolean, false);
                        break;
                    }
                    while (!([" ", "(", ")", "\n", undefined].includes(this.peek()))) {
                        this.advance();
                    }
                    throw new LexicalError(`Invalid boolean [${this.line}:${this.start - this.line_position + 1}]: ${this.code.slice(this.start, this.current)}`);
                }
                default: {
                    if (this.isNumber(char) || ["-", "+"].includes(char)) {
                        while (!([" ", "(", ")", "\n", undefined].includes(this.peek()))) {
                            this.advance();
                        }
                        const literal = Number(this.code.slice(this.start, this.current));

                        if (!isNaN(literal)) {
                            this.addToken(TokenType.Number, literal);
                            break;
                        } else {
                            if (this.isNumber(char)) {
                                throw new LexicalError(`Invalid number [${this.line}:${this.start - this.line_position + 1}]: ${this.code.slice(this.start, this.current)}`);
                            }
                            this.addToken(TokenType.Symbol, this.code.slice(this.start, this.current));
                            break;
                        }
                    }
                    if (this.isFirstSymbol(char) && !this.isNumber(char)) {
                        while (this.isSymbol(this.peek())
                        && !this.isEnd()
                        && ![" ", "(", ")", "\n", undefined].includes(this.peek())) {
                            this.advance();
                        }
                        this.addToken(TokenType.Symbol, this.code.slice(this.start, this.current));
                        break;
                    }
                    throw new LexicalError(`Unexpected symbol [${this.line}:${this.start - this.line_position + 1}]: ${this.code.slice(this.start, this.current)}`);
                }
            }
        }
        this.start = this.current;
        this.addToken(TokenType.Eof, null);
        return this.tokens;
    }


    isFirstSymbol(char) {
        return !this.isNumber(char) && !["(", ")", '"', "'", " ", "#"].includes(char);
    }

    isSymbol(char) {
        return !this.isNumber(char);
    }

    peek() {
        return this.code[this.current];
    }

    isNumber(char) {
        return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(char);
    }

    /**
     * @param {String} tokenType
     * @param {any} literal
     * */
    addToken(tokenType, literal) {
        const lexeme = this.code.slice(this.start, this.current);

        this.tokens.push(new Token(tokenType, lexeme, literal, this.line, this.start - this.line_position + 1))
    }

    /**
     * Return current char and change pointer on next
     * */
    advance() {
        return this.code[this.current++];
    }

    isEnd() {
        return this.current >= this.code.length;
    }

}