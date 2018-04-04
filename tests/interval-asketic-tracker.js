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
const asketic_tracker_1 = require("../lib/asketic-tracker");
const asketic_tracker_test_1 = require("./asketic-tracker-test");
const bundles_1 = require("../lib/bundles");
const cursor_1 = require("ancient-cursor/lib/cursor");
function default_1() {
    it('AsketicTracker:', () => __awaiter(this, void 0, void 0, function* () {
        const asketicTracker = new asketic_tracker_1.AsketicTracker();
        let results = [{ id: 4, num: 2 }];
        class TestIntervalAdapter extends interval_adapter_1.IntervalAdapter {
            fetch(item) {
                return __awaiter(this, void 0, void 0, function* () {
                    const query = _.get(item.query, 'schema.options.query');
                    const before = _.get(item.query, 'env.item.data');
                    if (query === 1)
                        return results.slice(2, 4);
                    if (query === 2)
                        return _.filter(results, r => r.num = before.num + 1);
                });
            }
        }
        const adapter = new TestIntervalAdapter();
        adapter.start({ interval: 1 });
        asketicTracker.init(asketic_tracker_test_1.starter(adapter));
        const cursor = new cursor_1.Cursor();
        bundles_1.trackerToBundles(asketicTracker, (bundles) => {
            _.each(bundles, b => cursor.apply(b));
        });
        yield asketicTracker.subscribe();
        yield asketic_tracker_test_1.default(cursor, () => __awaiter(this, void 0, void 0, function* () {
            results = _.times(6, i => ({ id: i + 1, num: i + 1 }));
            yield asketic_tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            results.push({ id: 9, num: 3 });
            results = _.sortBy(results, ['num', 'id']);
            yield asketic_tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 3 }).num = 5;
            results = _.sortBy(results, ['num', 'id']);
            yield asketic_tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 3 }).num = 6;
            results = _.sortBy(results, ['num', 'id']);
            yield asketic_tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.find(results, { id: 4 }).num = 3;
            results = _.sortBy(results, ['num', 'id']);
            yield asketic_tracker_test_1.delay(5);
        }), () => __awaiter(this, void 0, void 0, function* () {
            _.remove(results, d => d.id === 4);
            results = _.sortBy(results, ['num', 'id']);
            yield asketic_tracker_test_1.delay(5);
        }));
        yield asketicTracker.unsubscribe();
        yield adapter.stop();
    }));
}
exports.default = default_1;
//# sourceMappingURL=interval-asketic-tracker.js.map