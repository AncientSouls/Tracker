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
const _ = require("lodash");
exports.query = {
    schema: {
        name: 'query',
        options: {
            query: 1,
        },
        fields: {
            id: {},
            num: {},
            next: {
                name: 'query',
                options: {
                    query: 2,
                },
                fields: {
                    num: {},
                },
            },
        },
    },
};
exports.starter = adapter => (asketicTracker) => __awaiter(this, void 0, void 0, function* () {
    const resolver = (flow) => __awaiter(this, void 0, void 0, function* () {
        if (flow.env.name === 'query') {
            const tracker = yield asketicTracker.track(flow);
            return asketicTracker.resolveItemsTracker(flow, tracker, adapter, flow);
        }
        if (flow.env.type === 'items') {
            return asketicTracker.resolveItemData(flow, _.get(flow, 'data.data'));
        }
        return asketicTracker.resolveDefault(flow);
    });
    return yield asketicTracker.asket({
        query: exports.query,
        resolver: asketicTracker.createResolver(resolver),
    });
});
exports.delay = (t) => new Promise(resolve => setTimeout(resolve, t));
exports.default = (cursor, fill, insert9as3, change3to5, move3to6, move4to3, delete4) => __awaiter(this, void 0, void 0, function* () {
    console.log(cursor.data);
});
//# sourceMappingURL=asketic-tracker-test.js.map