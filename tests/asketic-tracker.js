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
const chance = require('chance').Chance();
const tracker_1 = require("../lib/tracker");
const asketic_tracker_1 = require("../lib/asketic-tracker");
const tracker_sqlite_equal_1 = require("../lib/tracker-sqlite-equal");
const delay = time => new Promise(resolve => setTimeout(resolve, time));
function default_1() {
    describe('AsketicTracker:', () => {
        it('asketic tracking static', () => __awaiter(this, void 0, void 0, function* () {
            const base = [];
            _.times(3, () => {
                base.push({ id: chance.fbid(), age: chance.age(), name: chance.name() });
            });
            const asketicTracker = new asketic_tracker_1.AsketicTracker();
            const events = [];
            asketicTracker.on('emit', ({ eventName }) => events.push(eventName));
            const results = yield asketicTracker.resubscribe({
                schema: {
                    fields: {
                        x: {
                            name: 'query',
                            fields: {
                                name: {},
                                y: {
                                    name: 'query',
                                    fields: {
                                        age: {},
                                    },
                                },
                            },
                        },
                    },
                },
            }, (flow) => __awaiter(this, void 0, void 0, function* () {
                if (_.get(flow, 'schema.name') === 'query') {
                    const tracker = new tracker_1.Tracker();
                    const items = yield tracker.resubscribe(_.get(flow, 'schema.query'), () => __awaiter(this, void 0, void 0, function* () { return _.map(base, (b, i) => tracker_sqlite_equal_1.toItem(b, i, 'id', tracker)); }), () => __awaiter(this, void 0, void 0, function* () { return () => null; }));
                    const data = _.map(items, i => i.data);
                    return { tracker, data };
                }
                return {};
            }));
            asketicTracker.destroy();
            chai_1.assert.deepEqual(events, [
                'tracked',
                'tracked',
                'tracked',
                'tracked',
                'subscribed',
                'untracked',
                'untracked',
                'untracked',
                'untracked',
                'unsubscribed',
                'destroyed',
            ]);
            chai_1.assert.deepEqual(results.data, {
                x: _.map(base, b => ({
                    name: b.name,
                    y: _.map(base, b => ({
                        age: b.age,
                    })),
                })),
            });
        }));
        it('asketic tracking events', () => __awaiter(this, void 0, void 0, function* () {
            const base = [];
            _.times(3, () => {
                base.push({ id: chance.fbid(), age: chance.age(), name: chance.name() });
            });
            const asketicTracker = new asketic_tracker_1.AsketicTracker();
            const events = [];
            asketicTracker.on('emit', ({ eventName }) => events.push(eventName));
            const trackers = [];
            const results = yield asketicTracker.resubscribe({
                schema: {
                    fields: {
                        x: {
                            name: 'query',
                            fields: {
                                name: {},
                                y: {
                                    name: 'query',
                                    fields: {
                                        age: {},
                                    },
                                },
                            },
                        },
                    },
                },
            }, (flow) => __awaiter(this, void 0, void 0, function* () {
                if (_.get(flow, 'schema.name') === 'query') {
                    const tracker = new tracker_1.Tracker();
                    const items = yield tracker.resubscribe(_.get(flow, 'schema.query'), () => __awaiter(this, void 0, void 0, function* () { return _.map(base, (b, i) => tracker_sqlite_equal_1.toItem(b, i, 'id', tracker)); }), (tracker) => __awaiter(this, void 0, void 0, function* () {
                        trackers.push(tracker);
                        return () => _.remove(trackers, t => t.id === tracker.id);
                    }));
                    const data = _.map(items, i => i.data);
                    return { tracker, data };
                }
                return {};
            }));
            chai_1.assert.deepEqual(results.data, {
                x: _.map(base, b => ({
                    name: b.name,
                    y: _.map(base, b => ({
                        age: b.age,
                    })),
                })),
            });
            const override = () => {
                _.each(trackers, tracker => tracker.override(_.map(base, (b, i) => tracker_sqlite_equal_1.toItem(b, i, 'id', tracker))));
            };
            const insert = () => __awaiter(this, void 0, void 0, function* () {
                yield delay(5);
                base.push({ id: chance.fbid(), age: chance.age(), name: chance.name() });
                override();
            });
            const update = (oldIndex = _.random(0, base.length - 1), newIndex = _.random(0, base.length - 1)) => __awaiter(this, void 0, void 0, function* () {
                yield delay(5);
                base.splice(newIndex, 0, base.splice(oldIndex, 1)[0]);
                override();
            });
            const remove = () => __awaiter(this, void 0, void 0, function* () {
                yield delay(5);
                const oldIndex = _.random(0, base.length - 1);
                base.splice(oldIndex, 1);
                override();
            });
            yield insert();
            yield insert();
            yield update(4, 2);
            yield update(1, 3);
            yield delay(5);
            asketicTracker.destroy();
            yield delay(5);
            chai_1.assert.deepEqual(events, [
                ..._.times(4, () => 'tracked'),
                ..._.times(1, () => 'subscribed'),
                ..._.times(1, () => 'tracked'),
                ..._.times(4, () => 'added'),
                ..._.times(1, () => 'tracked'),
                ..._.times(5, () => 'added'),
                ..._.times(1, () => 'tracked'),
                ..._.times(6, () => 'changed'),
                ..._.times(2, () => 'tracked'),
                ..._.times(14, () => 'changed'),
                ..._.times(9, () => 'untracked'),
                ..._.times(1, () => 'unsubscribed'),
                ..._.times(1, () => 'destroyed'),
            ]);
        }));
    });
}
exports.default = default_1;
//# sourceMappingURL=asketic-tracker.js.map