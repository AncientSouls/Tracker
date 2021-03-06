"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
exports.query = {
    schema: {
        name: 'a',
        options: {
            query: 1,
        },
        fields: {
            id: {},
            num: {},
            equal: {
                name: 'b',
                options: {
                    query: 2,
                },
                fields: {
                    id: {},
                },
            },
        },
    },
};
exports.test = (cursor, fill, insert9as3, change3to5, move3to6, move4to3, delete4) => __awaiter(this, void 0, void 0, function* () {
    chai_1.assert.deepEqual(cursor.data, []);
    yield fill();
    chai_1.assert.deepEqual(cursor.data, [
        { id: 3, num: 3, equal: [{ id: 3 }] },
        { id: 4, num: 4, equal: [{ id: 4 }] },
    ]);
    yield insert9as3();
    chai_1.assert.deepEqual(cursor.data, [
        { id: 3, num: 3, equal: [{ id: 3 }, { id: 9 }] },
        { id: 9, num: 3, equal: [{ id: 3 }, { id: 9 }] },
    ]);
    yield change3to5();
    chai_1.assert.deepEqual(cursor.data, [
        { id: 9, num: 3, equal: [{ id: 9 }] },
        { id: 4, num: 4, equal: [{ id: 4 }] },
    ]);
    yield move3to6();
    chai_1.assert.deepEqual(cursor.data, [
        { id: 9, num: 3, equal: [{ id: 9 }] },
        { id: 4, num: 4, equal: [{ id: 4 }] },
    ]);
    yield move4to3();
    chai_1.assert.deepEqual(cursor.data, [
        { id: 4, num: 3, equal: [{ id: 4 }, { id: 9 }] },
        { id: 9, num: 3, equal: [{ id: 4 }, { id: 9 }] },
    ]);
    yield delete4();
    chai_1.assert.deepEqual(cursor.data, [
        { id: 9, num: 3, equal: [{ id: 9 }] },
        { id: 5, num: 5, equal: [{ id: 5 }] },
    ]);
});
//# sourceMappingURL=test.js.map