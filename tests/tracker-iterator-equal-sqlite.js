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
const sqlite3 = require('sqlite3').verbose();
const tracker_iterator_equal_sqlite_1 = require("../lib/tracker-iterator-equal-sqlite");
const tracker_1 = require("../lib/tracker");
const delay = time => new Promise(resolve => setTimeout(resolve, time));
function default_1() {
    describe('TrackerSqliteEqual:', () => {
        let db;
        const exec = sql => new Promise(res => db.exec(sql, res));
        before((done) => {
            db = new sqlite3.Database(':memory:');
            db.serialize(done);
        });
        after((done) => {
            setTimeout(() => db.close(done), 5);
        });
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            yield exec('create table if not exists test (key int, value int);');
            yield exec('delete from test');
        }));
        it('resubscribe() added', () => __awaiter(this, void 0, void 0, function* () {
            yield exec(`insert into test (key,value) values ${_.times(9, t => `(${t + 1},${t + 1})`)};`);
            const { trackers, destroy, getItems, start } = tracker_iterator_equal_sqlite_1.createIterator(db, 1);
            const tracker = new tracker_1.Tracker();
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            const query = {
                sql: `select * from test;`,
                idField: 'key',
            };
            const items = yield tracker.resubscribe(query, getItems, start);
            yield delay(5);
            tracker.unsubscribe();
            yield delay(5);
            chai_1.assert.deepEqual(events, [
                'subscribed',
                ..._.times(9, () => 'added'),
                'unsubscribed',
            ]);
            chai_1.assert.deepEqual(tracker.ids, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
            chai_1.assert.deepEqual(tracker.versions, {
                1: { changed: true, memory: { key: 1, value: 1 } },
                2: { changed: true, memory: { key: 2, value: 2 } },
                3: { changed: true, memory: { key: 3, value: 3 } },
                4: { changed: true, memory: { key: 4, value: 4 } },
                5: { changed: true, memory: { key: 5, value: 5 } },
                6: { changed: true, memory: { key: 6, value: 6 } },
                7: { changed: true, memory: { key: 7, value: 7 } },
                8: { changed: true, memory: { key: 8, value: 8 } },
                9: { changed: true, memory: { key: 9, value: 9 } },
            });
            yield delay(5);
            destroy();
        }));
        it('insert update delete', () => __awaiter(this, void 0, void 0, function* () {
            const { trackers, destroy, getItems, start } = tracker_iterator_equal_sqlite_1.createIterator(db, 1);
            const tracker = new tracker_1.Tracker();
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            const query = {
                sql: `select * from test where value > 2 and value < 8 order by value asc limit 2;`,
                idField: 'key',
            };
            const items = yield tracker.resubscribe(query, getItems, start);
            yield exec(`insert into test (key,value) values ${_.times(9, t => `(${t + 1},${t + 1})`)};`);
            yield delay(5);
            yield exec(`update test set value = 10 where key = 3;`);
            yield delay(5);
            yield exec(`update test set value = 3 where key = 6;`);
            yield delay(5);
            yield exec(`update test set value = 3 where key = 4;`);
            yield delay(5);
            yield exec(`delete from test where key = 6;`);
            yield delay(5);
            tracker.unsubscribe();
            yield delay(5);
            chai_1.assert.deepEqual(events, [
                'subscribed',
                ..._.times(2, () => 'added'),
                'removed', 'added',
                'removed', 'added',
                'changed',
                'removed', 'added',
                'unsubscribed',
            ]);
            chai_1.assert.deepEqual(tracker.ids, [4, 5]);
            chai_1.assert.deepEqual(tracker.versions, {
                5: { changed: true, memory: { key: 5, value: 5 } },
                4: { changed: true, memory: { key: 4, value: 3 } },
            });
            yield delay(5);
            destroy();
        }));
    });
}
exports.default = default_1;
//# sourceMappingURL=tracker-iterator-equal-sqlite.js.map