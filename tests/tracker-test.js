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
exports.delay = (t) => new Promise(resolve => setTimeout(resolve, t));
exports.default = (adapter, tracker, asc, desc, fill, insert9as3, change3to5, move3to6, move4to3, delete4) => __awaiter(this, void 0, void 0, function* () {
    const events = [];
    tracker.on('emit', ({ eventName }) => events.push(eventName));
    tracker.init(adapter.track(asc));
    yield tracker.subscribe();
    chai_1.assert.deepEqual(tracker.ids, []);
    chai_1.assert.deepEqual(tracker.memory, {});
    yield fill();
    chai_1.assert.deepEqual(tracker.ids, [3, 4]);
    chai_1.assert.deepEqual(tracker.memory, {
        3: { id: 3, num: 3 },
        4: { id: 4, num: 4 },
    });
    yield insert9as3();
    chai_1.assert.deepEqual(tracker.ids, [3, 9]);
    chai_1.assert.deepEqual(tracker.memory, {
        3: { id: 3, num: 3 },
        9: { id: 9, num: 3 },
    });
    yield change3to5();
    chai_1.assert.deepEqual(tracker.ids, [9, 4]);
    chai_1.assert.deepEqual(tracker.memory, {
        9: { id: 9, num: 3 },
        4: { id: 4, num: 4 },
    });
    yield move3to6();
    chai_1.assert.deepEqual(tracker.ids, [9, 4]);
    chai_1.assert.deepEqual(tracker.memory, {
        9: { id: 9, num: 3 },
        4: { id: 4, num: 4 },
    });
    yield move4to3();
    chai_1.assert.deepEqual(tracker.ids, [4, 9]);
    chai_1.assert.deepEqual(tracker.memory, {
        4: { id: 4, num: 3 },
        9: { id: 9, num: 3 },
    });
    yield delete4();
    chai_1.assert.deepEqual(tracker.ids, [9, 5]);
    chai_1.assert.deepEqual(tracker.memory, {
        9: { id: 9, num: 3 },
        5: { id: 5, num: 5 },
    });
    yield tracker.unsubscribe();
    tracker.init(adapter.track(desc));
    yield tracker.subscribe();
    chai_1.assert.deepEqual(tracker.ids, [5, 9]);
    chai_1.assert.deepEqual(tracker.memory, {
        5: { id: 5, num: 5 },
        9: { id: 9, num: 3 },
    });
    yield tracker.unsubscribe();
    tracker.destroy();
    chai_1.assert.deepEqual(tracker.ids, [5, 9]);
    chai_1.assert.deepEqual(tracker.memory, {
        5: { id: 5, num: 5 },
        9: { id: 9, num: 3 },
    });
    tracker.clean();
    chai_1.assert.deepEqual(tracker.ids, []);
    chai_1.assert.deepEqual(tracker.memory, {});
    chai_1.assert.deepEqual(events, [
        'subscribed',
        'added', 'added',
        'removed', 'added',
        'removed', 'added',
        'changed',
        'removed', 'added',
        'unsubscribed',
        'changed',
        'subscribed',
        'unsubscribed', 'destroyed',
    ]);
});
//# sourceMappingURL=tracker-test.js.map