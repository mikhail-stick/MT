export const TokenType = {
    LeftBracket: "LeftBracket",
    RightBracket: "RightBracket",
    Symbol: "Symbol",
    Number: "Number",
    Boolean: "Boolean",
    String: "String",
    Eof: "Eof",
}

export class Token {
    /**
     * @param {String} tokenType
     * @param {String} lexeme
     * @param {any} literal
     * @param {Number} line
     * @param {Number} position
     * */
    constructor(tokenType, lexeme, literal, line, position) {
        this.tokenType = tokenType;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.position = position;
    }
}

export const Keywords = {
    Define: "define",
    Lambda: "lambda",
    If: "if",
    Quote: "quote",
    Set: 'set!',
    Begin: 'begin',
    Import: 'import'
}