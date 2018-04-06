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
const asketic_tracker_1 = require("../lib/asketic-tracker");
const tracker_test_1 = require("./tracker-test");
const asketic_tracker_test_1 = require("./asketic-tracker-test");
const bundles_1 = require("../lib/bundles");
const cursor_1 = require("ancient-cursor/lib/cursor");
exports.default = () => {
    it('IntervalAsketicTracker:', () => __awaiter(this, void 0, void 0, function* () {
        const at = new asketic_tracker_1.AsketicTracker();
        let results = [];
        class TestIntervalAdapter extends interval_adapter_1.IntervalAdapter {
            fetch(item) {
                return __awaiter(this, void 0, void 0, function* () {
                    const flow = item.query;
                    if (flow.schema.options.query === 1)
                        return _.cloneDeep(results.slice(2, 4));
                    if (flow.schema.options.query === 2) {
                        return _.cloneDeep(_.filter(results, r => r.num === flow.env.item.data.num));
                    }
                    throw new Error('wtf');
                });
            }
        }
        const adapter = new TestIntervalAdapter();
        adapter.start({ interval: 1 });
        const resolver = (flow) => __awaiter(this, void 0, void 0, function* () {
            if (flow.env.type === 'root') {
                if (flow.name === 'query') {
                    return yield at.flowTracker(flow, new tracker_1.Tracker().init(adapter.track(flow)));
                }
            }
            if (flow.env.type === 'items') {
                return at.flowItem(flow);
            }
            if (flow.env.type === 'item') {
                if (flow.name === 'query') {
                    return yield at.flowTracker(flow, new tracker_1.Tracker().init(adapter.track(flow)));
                }
                return at.flowValue(flow);
            }
            throw new Error('wtf');
        });
        at.init({
            query: asketic_tracker_test_1.query,
            resolver,
        });
        const cursor = new cursor_1.Cursor();
        bundles_1.trackerToBundles(at, (bundles, event, e) => {
            _.each(bundles, b => cursor.apply(b));
        });
        const result = yield at.subscribe();
        yield asketic_tracker_test_1.default(cursor, () => __awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=interval-asketic-tracker.js.map