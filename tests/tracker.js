"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const _ = require("lodash");
const chance = require('chance').Chance();
const tracker_1 = require("../lib/tracker");
const stress_1 = require("./stress");
function default_1() {
    describe('Tracker:', () => {
        it('add() added', () => {
            const tracker = new tracker_1.Tracker();
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.once('added', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 1, changed: true, data: 1, oldIndex: -1, newIndex: 0,
                });
            });
            tracker.add({ id: 1, version: { changed: true }, index: 0, data: 1 });
            tracker.once('added', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 2, changed: true, data: 2, oldIndex: -1, newIndex: 1,
                });
            });
            tracker.add({ id: 2, version: { changed: true }, index: 1, data: 2 });
            tracker.once('added', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 3, changed: true, data: 3, oldIndex: -1, newIndex: 0,
                });
            });
            tracker.add({ id: 3, version: { changed: true }, index: 0, data: 3 });
            chai_1.assert.deepEqual(events, ['added', 'added', 'added']);
            chai_1.assert.deepEqual(tracker.ids, [3, 1, 2]);
            chai_1.assert.deepEqual(tracker.versions, {
                1: { changed: true },
                2: { changed: true },
                3: { changed: true },
            });
        });
        it('change() changed', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: { changed: true }, index: 0, data: 1 });
            tracker.add({ id: 2, version: { changed: true }, index: 1, data: 2 });
            tracker.add({ id: 3, version: { changed: true }, index: 0, data: 3 });
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.once('changed', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 1, changed: true, data: 4, oldIndex: 1, newIndex: 2,
                });
            });
            tracker.change({ id: 1, version: { changed: true }, index: 2, data: 4 });
            chai_1.assert.deepEqual(events, ['changed']);
            chai_1.assert.deepEqual(tracker.ids, [3, 2, 1]);
            chai_1.assert.deepEqual(tracker.versions, {
                1: { changed: true },
                2: { changed: true },
                3: { changed: true },
            });
        });
        it('remove() removed', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: { changed: true }, index: 0, data: 1 });
            tracker.add({ id: 2, version: { changed: true }, index: 1, data: 2 });
            tracker.add({ id: 3, version: { changed: true }, index: 0, data: 3 });
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.once('removed', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 1, oldIndex: 1, newIndex: -1,
                });
            });
            tracker.remove({ id: 1 });
            chai_1.assert.deepEqual(events, ['removed']);
            chai_1.assert.deepEqual(tracker.ids, [3, 2]);
            chai_1.assert.deepEqual(tracker.versions, {
                2: { changed: true },
                3: { changed: true },
            });
        });
        it('override() removed changed added', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: { changed: true }, index: 0, data: 1 });
            tracker.add({ id: 2, version: { changed: true }, index: 1, data: 2 });
            tracker.add({ id: 3, version: { changed: true }, index: 0, data: 3 });
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.once('removed', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 1, oldIndex: 1, newIndex: -1,
                });
            });
            tracker.once('changed', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 2, changed: true, data: 5, oldIndex: 1, newIndex: 0,
                });
                tracker.once('changed', (data) => {
                    chai_1.assert.deepEqual(data, {
                        tracker, id: 3, changed: true, data: 3, oldIndex: 1, newIndex: 1,
                    });
                });
            });
            tracker.once('added', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 4, changed: true, data: 4, oldIndex: -1, newIndex: 2,
                });
            });
            tracker.override([
                { id: 2, version: { changed: true }, index: 0, data: 5 },
                { id: 3, version: { changed: true }, index: 1, data: 3 },
                { id: 4, version: { changed: true }, index: 2, data: 4 },
            ]);
            chai_1.assert.deepEqual(events, ['removed', 'changed', 'changed', 'added']);
            chai_1.assert.deepEqual(tracker.ids, [2, 3, 4]);
            chai_1.assert.deepEqual(tracker.versions, {
                2: { changed: true },
                3: { changed: true },
                4: { changed: true },
            });
        });
        it('clean() removed', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: { changed: true }, index: 0, data: 1 });
            tracker.add({ id: 2, version: { changed: true }, index: 1, data: 2 });
            tracker.add({ id: 3, version: { changed: true }, index: 0, data: 3 });
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.clean();
            chai_1.assert.deepEqual(events, ['removed', 'removed', 'removed']);
            chai_1.assert.deepEqual(tracker.ids, []);
            chai_1.assert.deepEqual(tracker.versions, {});
        });
        it('override() stress', () => {
            const tracker = new tracker_1.Tracker();
            const base = [];
            const override = () => {
                tracker.override(_.map(base, (b, i) => ({
                    id: b.id, version: { changed: true }, index: i, data: b,
                })));
            };
            stress_1.stress(() => {
                base.push({ id: chance.fbid(), age: chance.age(), name: chance.name() });
                override();
            }, () => {
                const oldIndex = _.random(0, base.length - 1);
                const newIndex = _.random(0, base.length - 1);
                base.splice(newIndex, 0, base.splice(oldIndex, 1)[0]);
                override();
            }, () => {
                const oldIndex = _.random(0, base.length - 1);
                base.splice(oldIndex, 1);
                override();
            });
            chai_1.assert.deepEqual(tracker.ids, _.map(base, b => b.id));
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=tracker.js.map