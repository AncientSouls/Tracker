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
const _ = require("lodash");
const asketic_tracker_1 = require("../lib/asketic-tracker");
const utils_1 = require("./utils");
function default_1() {
    describe('AsketicTracker:', () => {
        it('lifecycle', () => __awaiter(this, void 0, void 0, function* () {
            const db = yield utils_1.startDb();
            const tracker = new asketic_tracker_1.AsketicTracker();
            const query = {
                schema: {
                    name: 'select',
                    options: {
                        sql: `select * from test where v > 2 and v < 8 order by v asc limit 2;`,
                    },
                    fields: {
                        v: {},
                        next: {
                            name: 'select',
                            options: {
                                sql: `select * from test where v = <%= v+1 %>;`,
                            },
                            fields: {
                                v: {},
                            },
                        },
                    },
                },
            };
            tracker.init(utils_1.newAsketicTrackerStart(db, query));
            yield utils_1.exec(db, `create table test (id integer primary key autoincrement, v integer);`);
            yield utils_1.exec(db, `insert into test (v) values ${_.times(9, t => `(${t + 1})`)};`);
            let results;
            tracker.on('added', ({ item, result, path }) => {
                _.get(results.data, path, results.data).splice(item.newIndex, 0, result.data);
            });
            tracker.on('changed', ({ item, result, path }) => {
                _.get(results.data, path, results.data).splice(item.oldIndex, 1);
                _.get(results.data, path, results.data).splice(item.newIndex, 0, result.data);
            });
            tracker.on('removed', ({ item, path }) => {
                _.get(results.data, path, results.data).splice(item.oldIndex, 1);
            });
            results = yield tracker.subscribe();
            chai_1.assert.deepEqual(results.data, _.times(2, t => ({
                v: t + 3,
                next: [{ v: t + 4 }],
            })));
            yield utils_1.exec(db, `update test set v = 6 where id = 3`);
            yield utils_1.delay(100);
            chai_1.assert.deepEqual(results.data, _.times(2, t => ({
                v: t + 4,
                next: _.times(t ? 2 : 1, d => ({ v: t + 5 })),
            })));
            yield utils_1.exec(db, `update test set v = 7 where id = 6`);
            yield utils_1.delay(100);
            chai_1.assert.deepEqual(results.data, _.times(2, t => ({
                v: t + 4,
                next: [{ v: t + 5 }],
            })));
            yield tracker.unsubscribe();
            yield utils_1.delay(100);
            yield utils_1.stopDb(db);
            chai_1.assert.deepEqual(tracker.trackers, []);
        }));
    });
}
exports.default = default_1;
//# sourceMappingURL=asketic-tracker.js.map