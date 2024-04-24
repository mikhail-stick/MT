export class Expr {
}

export class LiteralExpr extends Expr {
    /**
     * @param {Token} token
     */
    constructor(token) {
        super();
        this.token = token;
    }
}

export class SymbolExpr extends Expr {
    /**
     * @param {Token} token
     * */
    constructor(token) {
        super();
        this.token = token;
    }
}

export class DefineExpr extends Expr {
    /**
     * @param {Token} variable
     * @param {Expr} value
     * */
    constructor(variable, value) {
        super();
        this.variable = variable;
        this.value = value;
    }
}

export class CallExpr extends Expr {
    /**
     * @param {Expr} called
     * @param {Expr[]} args
     * */
    constructor(called, args) {
        super();
        this.called = called;
        this.args = args;
    }
}

export class LambdaExpr extends Expr {
    /**
     * @param {Token[]} args
     * @param {Expr[]} body
     * @param {Boolean} isSpread
     * */
    constructor(args, body, isSpread=false) {
        super();
        this.args = args;
        this.body = body;
        this.isSpread = isSpread;
    }
}

export class IfExpr extends Expr {
    /**
     * @param{Expr} condition
     * @param{Expr} trueExpr
     * @param{Expr} falseExpr
     * */
    constructor(condition, trueExpr, falseExpr) {
        super();
        this.condition = condition;
        this.trueExpr = trueExpr;
        this.falseExpr = falseExpr;
    }
}

export class BeginExpr extends Expr {
    /**
     * @param{Expr[]} expression
     * */
    constructor(expression) {
        super();
        this.expression = expression;
    }
}

export class QuoteExpr {
    /**
     *
     * @param {Expr} value
     */
    constructor(value) {
        this.value = value;
    }
}

export class ListExpr extends Expr {
    /**
     *
     * @param {Expr[]} items
     */
    constructor(items) {
        super();
        this.items = items;
    }
}

export class SetExpr extends Expr {
    /**
     * @param {Token} name
     * @param {Expr} value
     */
    constructor(name, value) {
        super();
        this.name = name;
        this.value = value;
    }
}


export class ImportExpr extends Expr {
    /**
     * @param {Expr} value
     */
    constructor(value) {
        super();
        this.value = value;
    }
}

export class ReturnExpr extends Expr {
    /**
     * @param {Expr} value
     */
    constructor(value) {
        super();
        this.value = value;
    }
}

export const NULL_VALUE = []