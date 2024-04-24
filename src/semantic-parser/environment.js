import {SemanticError} from "../errors.js";

export class Environment {

    /**
     * @param{Token|Token[]=} keys
     * @param{any|any[]=} values
     * @param{Environment=} closestEnv
     * */
    constructor(closestEnv, keys, values) {
        this.declarations = {};

        if (typeof keys !== "undefined" && typeof values !== "undefined") {
            if (!this.isArrays(keys, values)) {
                throw new Error();
            }

            // if (this.isArrays(keys, values)) {
            if (keys.length !== values.length) {
                throw new Error();
            }
            for (let i = 0; i <= keys.length - 1; i++) {
                this.declarations[keys[i].lexeme] = values[i];
            }
            // } else {
            //     this.declarations[keys.lexeme] = values;
            // }
        }

        this.closestEnv = closestEnv;
    }

    getKeyByValue(value) {
        return Object.keys(this.declarations).find(key => this.declarations[key] === value);
    }

    isArrays(keys, values) {
        return !(Array.isArray(keys) && !Array.isArray(values) || !Array.isArray(keys) && Array.isArray(values));
    }

    define(key, value) {
        this.declarations[key] = value;
    }

    /**
     * @param{String} key
     * @param{any} value
     * */
    set(key, value) {
        if (key in this.declarations) {
            return this.declarations[key] = value;
        }
        if (this.closestEnv) {
            return this.closestEnv.set(key, value);
        }
        throw new Error();
    }

    /**
     * @param{String} key
     * */
    get(key) {
        if (key in this.declarations) {
            return this.declarations[key];
        }
        if (this.closestEnv) {
            return this.closestEnv.get(key);
        }
        throw new SemanticError(`Unbound variable ${key}`);
    }
}