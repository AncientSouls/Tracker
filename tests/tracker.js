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
const tracker_1 = require("../lib/tracker");
const client_1 = require("../lib/client");
exports.default = () => {
    describe('Tracker:', () => {
        it('checking .set(), .get() and events', () => __awaiter(this, void 0, void 0, function* () {
            const client = new client_1.Client();
            yield client.start();
            const tracker = new tracker_1.Tracker();
            client.add(tracker);
            const events = [];
            tracker.on('added', ({ change: { id } }) => events.push(`added${id}`));
            tracker.on('changed', ({ change: { id } }) => events.push(`changed${id}`));
            tracker.on('removed', ({ change: { id } }) => events.push(`removed${id}`));
            chai_1.assert.deepEqual(yield tracker.get(), []);
            yield tracker.set([
                { _id: 3, num: 3 },
                { _id: 4, num: 4 },
            ]);
            chai_1.assert.deepEqual(yield tracker.get(), [
                { id: '3', item: { _id: 3, num: 3 }, oldIndex: -1, newIndex: 0 },
                { id: '4', item: { _id: 4, num: 4 }, oldIndex: -1, newIndex: 1 },
            ]);
            yield tracker.set([
                { _id: 3, num: 3 },
                { _id: 9, num: 3 },
            ]);
            chai_1.assert.deepEqual(yield tracker.get(), [
                { id: '4', item: { _id: 4, num: 4 }, oldIndex: 1, newIndex: -1 },
                { id: '9', item: { _id: 9, num: 3 }, oldIndex: -1, newIndex: 1 },
            ]);
            chai_1.assert.deepEqual(yield tracker.get(), []);
            yield tracker.set([
                { _id: 9, num: 3 },
                { _id: 4, num: 4 },
            ]);
            yield tracker.set([
                { _id: 4, num: 3 },
                { _id: 9, num: 3 },
            ]);
            yield tracker.set([
                { _id: 9, num: 3 },
                { _id: 5, num: 5 },
            ]);
            chai_1.assert.deepEqual(yield tracker.get(), [
                { id: '3', item: { _id: 3, num: 3 }, oldIndex: 0, newIndex: -1 },
                { id: '5', item: { _id: 5, num: 5 }, oldIndex: -1, newIndex: 1 },
            ]);
            chai_1.assert.deepEqual(events, [
                'added3', 'added4',
                'added9', 'removed4',
                'added5', 'removed3',
            ]);
            client.remove(tracker);
            yield client.stop();
        }));
    });
};
//# sourceMappingURL=tracker.js.map