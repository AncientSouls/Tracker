"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const tracker_1 = require("../lib/tracker");
function default_1() {
    describe('Tracker:', () => {
        it('add() added', () => {
            const tracker = new tracker_1.Tracker();
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.once('added', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 1, version: 0, data: 1, oldIndex: -1, newIndex: 0,
                });
            });
            tracker.add({ id: 1, version: 0, index: 0, data: 1 });
            tracker.once('added', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 2, version: 0, data: 2, oldIndex: -1, newIndex: 1,
                });
            });
            tracker.add({ id: 2, version: 0, index: 1, data: 2 });
            tracker.once('added', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 3, version: 0, data: 3, oldIndex: -1, newIndex: 0,
                });
            });
            tracker.add({ id: 3, version: 0, index: 0, data: 3 });
            chai_1.assert.deepEqual(events, ['added', 'added', 'added']);
            chai_1.assert.deepEqual(tracker.ids, [3, 1, 2]);
            chai_1.assert.deepEqual(tracker.versions, { 1: 0, 2: 0, 3: 0 });
        });
        it('change() changed', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: 0, index: 0, data: 1 });
            tracker.add({ id: 2, version: 0, index: 1, data: 2 });
            tracker.add({ id: 3, version: 0, index: 0, data: 3 });
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.once('changed', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 1, version: 1, data: 4, oldIndex: 1, newIndex: 2,
                });
            });
            tracker.change({ id: 1, version: 1, index: 2, data: 4 });
            chai_1.assert.deepEqual(events, ['changed']);
            chai_1.assert.deepEqual(tracker.ids, [3, 2, 1]);
            chai_1.assert.deepEqual(tracker.versions, { 1: 1, 2: 0, 3: 0 });
        });
        it('remove() removed', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: 0, index: 0, data: 1 });
            tracker.add({ id: 2, version: 0, index: 1, data: 2 });
            tracker.add({ id: 3, version: 0, index: 0, data: 3 });
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
            chai_1.assert.deepEqual(tracker.versions, { 2: 0, 3: 0 });
        });
        it('remove() removed', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: 0, index: 0, data: 1 });
            tracker.add({ id: 2, version: 0, index: 1, data: 2 });
            tracker.add({ id: 3, version: 0, index: 0, data: 3 });
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
            chai_1.assert.deepEqual(tracker.versions, { 2: 0, 3: 0 });
        });
        it('override() removed changed added', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: 0, index: 0, data: 1 });
            tracker.add({ id: 2, version: 0, index: 1, data: 2 });
            tracker.add({ id: 3, version: 0, index: 0, data: 3 });
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.once('removed', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 1, oldIndex: 1, newIndex: -1,
                });
            });
            tracker.on('changed', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 2, version: 1, data: 5, oldIndex: 1, newIndex: 0,
                });
            });
            tracker.once('added', (data) => {
                chai_1.assert.deepEqual(data, {
                    tracker, id: 4, version: 0, data: 4, oldIndex: -1, newIndex: 2,
                });
            });
            tracker.override([
                { id: 2, version: 1, index: 0, data: 5 },
                { id: 3, version: 0, index: 1, data: 3 },
                { id: 4, version: 0, index: 2, data: 4 },
            ]);
            chai_1.assert.deepEqual(events, ['removed', 'changed', 'added']);
            chai_1.assert.deepEqual(tracker.ids, [2, 3, 4]);
            chai_1.assert.deepEqual(tracker.versions, { 2: 1, 3: 0, 4: 0 });
        });
        it('clean() removed', () => {
            const tracker = new tracker_1.Tracker();
            tracker.add({ id: 1, version: 0, index: 0, data: 1 });
            tracker.add({ id: 2, version: 0, index: 1, data: 2 });
            tracker.add({ id: 3, version: 0, index: 0, data: 3 });
            const events = [];
            tracker.on('emit', ({ eventName }) => events.push(eventName));
            tracker.clean();
            chai_1.assert.deepEqual(events, ['removed', 'removed', 'removed']);
            chai_1.assert.deepEqual(tracker.ids, []);
            chai_1.assert.deepEqual(tracker.versions, {});
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=tracker.js.map