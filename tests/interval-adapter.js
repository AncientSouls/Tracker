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
const interval_adapter_1 = require("../lib/interval-adapter");
const tracker_1 = require("../lib/tracker");
const tracker_test_1 = require("./tracker-test");
exports.default = () => {
    it('IntervalAdapter:', () => __awaiter(this, void 0, void 0, function* () {
        let results = [];
        class TestIntervalAdapter extends interval_adapter_1.IntervalAdapter {
            fetch(item) {
                return __awaiter(this, void 0, void 0, function* () {
                    return _.cloneDeep((item.query ? results : _.reverse(results)).slice(2, 4));
                });
            }
        }
        const adapter = new TestIntervalAdapter();
        const tracker = new tracker_1.Tracker();
        adapter.start({ interval: 1 });
        yield tracker_test_1.default(adapter, tracker, 1, 0, () => __awaiter(this, void 0, void 0, function* () {
            results = _.times(6, i => ({ id: i + 1, num: i + 1 }));
            yield tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            results.push({ id: 9, num: 3 });
            results = _.sortBy(results, ['num', 'id']);
            yield tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 3 }).num = 5;
            results = _.sortBy(results, ['num', 'id']);
            yield tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 3 }).num = 6;
            results = _.sortBy(results, ['num', 'id']);
            yield tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 4 }).num = 3;
            results = _.sortBy(results, ['num', 'id']);
            yield tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.remove(results, d => d.id === 4);
            results = _.sortBy(results, ['num', 'id']);
            yield tracker_test_1.delay(5);
        }));
        yield adapter.stop();
    }));
};
//# sourceMappingURL=interval-adapter.js.map