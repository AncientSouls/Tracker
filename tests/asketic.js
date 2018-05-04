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
const tracker_1 = require("../lib/tracker");
const client_1 = require("../lib/client");
const asket_1 = require("ancient-asket/lib/asket");
const asketic_1 = require("../lib/asketic");
const bundles_1 = require("../lib/bundles");
const cursor_1 = require("ancient-cursor/lib/cursor");
const test_1 = require("./test");
const delay = (time) => __awaiter(this, void 0, void 0, function* () { return new Promise(res => setTimeout(res, time)); });
exports.default = () => {
    describe('Asketic:', () => __awaiter(this, void 0, void 0, function* () {
        it('using ancient-asket for hierarchical queries', () => __awaiter(this, void 0, void 0, function* () {
            const client = new client_1.Client();
            yield client.start();
            let data = [];
            const _update = (tracker) => {
                if (tracker.query.name === 'a')
                    tracker.set(data.slice(2, 4));
                if (tracker.query.name === 'b') {
                    tracker.set(_.filter(data, r => r.num === tracker.query.env.item.num));
                }
            };
            client.tracking = _update;
            const asketic = new asketic_1.Asketic();
            const flow = {
                query: test_1.query,
                next: asket_1.asket,
                resolver: (flow) => __awaiter(this, void 0, void 0, function* () {
                    if (flow.name === 'a' && flow.env.type === 'root') {
                        const tracker = new tracker_1.Tracker();
                        tracker.idField = 'id';
                        tracker.query = flow;
                        client.add(tracker);
                        return asketic.flowTracker(flow, tracker);
                    }
                    if (flow.name === 'b' && flow.env.type === 'item') {
                        const tracker = new tracker_1.Tracker();
                        tracker.idField = 'id';
                        tracker.query = flow;
                        client.add(tracker);
                        return asketic.flowTracker(flow, tracker);
                    }
                    if (flow.env.type === 'items')
                        return asketic.flowItem(flow);
                    return asketic.flowValue(flow);
                }),
            };
            const cursor = new cursor_1.Cursor();
            const result = yield asketic.next(flow);
            cursor.apply(bundles_1.dataToBundle(result.data));
            const update = (d) => __awaiter(this, void 0, void 0, function* () {
                data = d;
                _.each(client.list.nodes, _update);
                const changes = yield asketic.get();
                const bundles = bundles_1.asketicChangesToBundles(changes);
                _.each(bundles, bundle => cursor.apply(bundle));
            });
            yield test_1.test(cursor, () => __awaiter(this, void 0, void 0, function* () {
                yield update([
                    { id: 1, num: 1 },
                    { id: 2, num: 2 },
                    { id: 3, num: 3 },
                    { id: 4, num: 4 },
                    { id: 5, num: 5 },
                    { id: 6, num: 6 },
                ]);
            }), () => __awaiter(this, void 0, void 0, function* () {
                yield update([
                    { id: 1, num: 1 },
                    { id: 2, num: 2 },
                    { id: 3, num: 3 },
                    { id: 9, num: 3 },
                    { id: 4, num: 4 },
                    { id: 5, num: 5 },
                    { id: 6, num: 6 },
                ]);
            }), () => __awaiter(this, void 0, void 0, function* () {
                yield update([
                    { id: 1, num: 1 },
                    { id: 2, num: 2 },
                    { id: 9, num: 3 },
                    { id: 4, num: 4 },
                    { id: 3, num: 5 },
                    { id: 5, num: 5 },
                    { id: 6, num: 6 },
                ]);
            }), () => __awaiter(this, void 0, void 0, function* () {
                yield update([
                    { id: 1, num: 1 },
                    { id: 2, num: 2 },
                    { id: 9, num: 3 },
                    { id: 4, num: 4 },
                    { id: 5, num: 5 },
                    { id: 3, num: 6 },
                    { id: 6, num: 6 },
                ]);
            }), () => __awaiter(this, void 0, void 0, function* () {
                yield update([
                    { id: 1, num: 1 },
                    { id: 2, num: 2 },
                    { id: 4, num: 3 },
                    { id: 9, num: 3 },
                    { id: 5, num: 5 },
                    { id: 3, num: 6 },
                    { id: 6, num: 6 },
                ]);
            }), () => __awaiter(this, void 0, void 0, function* () {
                yield update([
                    { id: 1, num: 1 },
                    { id: 2, num: 2 },
                    { id: 9, num: 3 },
                    { id: 5, num: 5 },
                    { id: 3, num: 6 },
                    { id: 6, num: 6 },
                ]);
            }));
            asketic.destroy();
        }));
    }));
};
//# sourceMappingURL=asketic.js.map