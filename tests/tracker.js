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
const tracker_1 = require("../lib/tracker");
const utils_1 = require("./utils");
function default_1() {
    describe('Tracker:', () => {
        it('lifecycle', () => __awaiter(this, void 0, void 0, function* () {
            const t = new utils_1.TestTracking();
            yield t.start(yield utils_1.startDb());
            const tracker = new tracker_1.Tracker();
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            const s1 = `select * from test where v > 2 and v < 8 order by v asc limit 2`;
            const s2 = `select * from test where v > 2 and v < 8 order by v desc limit 2`;
            tracker.init(t.track(s1));
            yield utils_1.exec(t.db, `create table test (id integer primary key autoincrement, v integer);`);
            yield utils_1.exec(t.db, `insert into test (v) values ${_.times(9, t => `(${t + 1})`)};`);
            yield tracker.subscribe();
            chai_1.assert.deepEqual(tracker.ids, [3, 4]);
            chai_1.assert.deepEqual(tracker.memory, {
                3: { id: 3, v: 3 },
                4: { id: 4, v: 4 },
            });
            yield utils_1.exec(t.db, `update test set v = 6 where id = 3`);
            yield utils_1.delay(100);
            chai_1.assert.deepEqual(tracker.ids, [4, 5]);
            chai_1.assert.deepEqual(tracker.memory, {
                4: { id: 4, v: 4 },
                5: { id: 5, v: 5 },
            });
            yield utils_1.exec(t.db, `update test set v = 3 where id = 5`);
            yield utils_1.delay(100);
            chai_1.assert.deepEqual(tracker.ids, [5, 4]);
            chai_1.assert.deepEqual(tracker.memory, {
                4: { id: 4, v: 4 },
                5: { id: 5, v: 3 },
            });
            yield utils_1.exec(t.db, `update test set v = 5 where id = 5`);
            yield utils_1.delay(100);
            chai_1.assert.deepEqual(tracker.ids, [4, 5]);
            chai_1.assert.deepEqual(tracker.memory, {
                4: { id: 4, v: 4 },
                5: { id: 5, v: 5 },
            });
            yield tracker.unsubscribe();
            chai_1.assert.deepEqual(tracker.ids, [4, 5]);
            chai_1.assert.deepEqual(tracker.memory, {
                4: { id: 4, v: 4 },
                5: { id: 5, v: 5 },
            });
            tracker.init(t.track(s2));
            yield tracker.subscribe();
            chai_1.assert.deepEqual(tracker.ids, [7, 3]);
            chai_1.assert.deepEqual(tracker.memory, {
                7: { id: 7, v: 7 },
                3: { id: 3, v: 6 },
            });
            yield tracker.unsubscribe();
            tracker.destroy();
            chai_1.assert.deepEqual(tracker.ids, [7, 3]);
            chai_1.assert.deepEqual(tracker.memory, {
                7: { id: 7, v: 7 },
                3: { id: 3, v: 6 },
            });
            tracker.clean();
            chai_1.assert.deepEqual(tracker.ids, []);
            chai_1.assert.deepEqual(tracker.memory, {});
            yield utils_1.delay(100);
            yield t.stop();
            chai_1.assert.deepEqual(events, [
                'added', 'added',
                'subscribed',
                'removed', 'added',
                'changed', 'changed', 'changed',
                'unsubscribed',
                'removed', 'removed',
                'added', 'added',
                'subscribed',
                'unsubscribed', 'destroyed',
            ]);
        }));
    });
}
exports.default = default_1;
//# sourceMappingURL=tracker.js.map