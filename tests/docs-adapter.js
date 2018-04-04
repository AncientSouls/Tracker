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
const docs_adapter_1 = require("../lib/docs-adapter");
const tracker_1 = require("../lib/tracker");
const tracker_test_1 = require("./tracker-test");
exports.default = () => {
    it('DocsAdapter:', () => __awaiter(this, void 0, void 0, function* () {
        let results = [];
        let trackedItem;
        class TestDocsAdapter extends docs_adapter_1.DocsAdapter {
            tracked(item) {
                return __awaiter(this, void 0, void 0, function* () {
                    trackedItem = item;
                });
            }
            fetch(item) {
                return __awaiter(this, void 0, void 0, function* () {
                    return (item.query ? results : _.reverse(results)).slice(2, 4);
                });
            }
        }
        const adapter = new TestDocsAdapter();
        const tracker = new tracker_1.Tracker();
        adapter.start({});
        yield tracker_test_1.default(adapter, tracker, 1, 0, () => __awaiter(this, void 0, void 0, function* () {
            results = _.times(6, i => ({ id: i + 1, num: i + 1 }));
            yield adapter.override({ tracker, query: 1 });
        }), () => __awaiter(this, void 0, void 0, function* () {
            results.push({ id: 9, num: 3 });
            results = _.sortBy(results, ['num', 'id']);
            yield adapter.remove(4, { tracker, query: 1 });
            const _r = results.slice(2, 4);
            const i = _.findIndex(_r, { id: 9 });
            yield adapter.add(_r[i], i, { tracker, query: 1 });
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 3 }).num = 5;
            results = _.sortBy(results, ['num', 'id']);
            yield adapter.remove(3, { tracker, query: 1 });
            const _r = results.slice(2, 4);
            const i = _.findIndex(_r, { id: 4 });
            yield adapter.add(_r[i], i, { tracker, query: 1 });
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 3 }).num = 6;
            results = _.sortBy(results, ['num', 'id']);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 4 }).num = 3;
            results = _.sortBy(results, ['num', 'id']);
            const _r = results.slice(2, 4);
            const i = _.findIndex(_r, { id: 4 });
            yield adapter.change(_r[i], i, { tracker, query: 1 });
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.remove(results, d => d.id === 4);
            results = _.sortBy(results, ['num', 'id']);
            yield adapter.remove(4, { tracker, query: 1 });
            const _r = results.slice(2, 4);
            const i = _.findIndex(_r, { id: 5 });
            yield adapter.add(_r[i], i, { tracker, query: 1 });
        }));
        yield adapter.stop();
    }));
};
//# sourceMappingURL=docs-adapter.js.map