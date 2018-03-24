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
const node_1 = require("ancient-mixins/lib/node");
const tracker_1 = require("./tracker");
const asket_1 = require("ancient-asket/lib/asket");
function mixin(superClass, trackerClass) {
    return class AsketicTracker extends superClass {
        constructor() {
            super(...arguments);
            this.trackerClass = trackerClass;
            this.isStarted = false;
            this.trackers = [];
        }
        init(ask) {
            if (this.isStarted) {
                throw new Error(`Started tracker ${this.id} cant be inited.`);
            }
            this.ask = ask;
        }
        resolveItemData(flow, data) {
            return Object.assign({}, flow, { data, env: Object.assign({}, flow.env, { item: flow.data, type: 'data', path: flow.env.nextPath }) });
        }
        resolveItemsArray(flow, items) {
            return Object.assign({}, flow, { data: items, env: Object.assign({}, flow.env, { type: 'items', path: flow.env.nextPath }) });
        }
        resolveDefault(flow) {
            return Object.assign({}, flow, { env: Object.assign({}, flow.env, { type: 'query', path: flow.env.nextPath }) });
        }
        watchTracker(tracker, flow) {
            tracker.on('added', (item) => __awaiter(this, void 0, void 0, function* () {
                const itemPath = [...flow.env.nextPath, item.newIndex];
                const result = yield this.asket(Object.assign({}, flow, { query: { schema: flow.schema }, data: item, env: Object.assign({}, flow.env, { type: 'items', path: itemPath }) }));
                this.emit('added', {
                    item, result, flow,
                    asketicTracker: this,
                    path: flow.env.nextPath,
                });
            }));
            tracker.on('changed', (item) => __awaiter(this, void 0, void 0, function* () {
                const itemPath = [...flow.env.nextPath, item.newIndex];
                const result = yield this.asket(Object.assign({}, flow, { query: { schema: flow.schema }, data: item, env: Object.assign({}, flow.env, { type: 'items', path: itemPath }) }));
                this.emit('changed', {
                    item, result, flow,
                    asketicTracker: this,
                    path: flow.env.nextPath,
                });
            }));
            tracker.on('removed', (item) => __awaiter(this, void 0, void 0, function* () {
                this.emit('removed', {
                    item, flow,
                    asketicTracker: this,
                    path: flow.env.nextPath,
                });
            }));
            if (flow.env.item) {
                const parent = flow.env.item.tracker;
                parent.on('destroyed', () => tracker.isStarted && this.untrack(tracker, flow));
                parent.on('removed', ({ id }) => {
                    id === flow.env.item.id && this.untrack(tracker, flow);
                });
                parent.on('changed', ({ id }) => {
                    id === flow.env.item.id && this.untrack(tracker, flow);
                });
            }
        }
        track(flow) {
            const tracker = new this.trackerClass();
            this.trackers.push(tracker);
            tracker.once('subscribed', () => {
                this.emit('tracked', { flow, tracker, asketicTracker: this });
                this.watchTracker(tracker, flow);
            });
            this.emit('track', { flow, tracker, asketicTracker: this });
            return tracker;
        }
        untrack(tracker, flow) {
            return __awaiter(this, void 0, void 0, function* () {
                this.emit('untrack', { flow, tracker, asketicTracker: this });
                yield tracker.unsubscribe();
                _.remove(this.trackers, t => t === tracker);
                this.emit('untracked', { flow, tracker, asketicTracker: this });
                tracker.destroy();
            });
        }
        subscribe() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isStarted) {
                    throw new Error(`Started asketic tracker ${this.id} cant be subscribed.`);
                }
                this.isStarted = true;
                const results = yield this.ask(this);
                this.emit('subscribed', { results, asketicTracker: this });
                return results;
            });
        }
        unsubscribe() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isStarted) {
                    throw new Error(`Not started asketic tracker ${this.id} cant be unsubscribed.`);
                }
                this.isStarted = false;
                const trackers = _.map(this.trackers, t => this.untrack(t));
                yield Promise.all(trackers);
                this.emit('unsubscribed', { asketicTracker: this });
                return this;
            });
        }
        createResolver(resolver) {
            return (flow) => {
                flow.env.name = _.get(flow, 'schema.name');
                flow.env.nextPath = !_.isUndefined(flow.key) ? [...flow.env.path, flow.key] : flow.env.path;
                return resolver(flow);
            };
        }
        asket(flow) {
            return asket_1.asket(Object.assign({}, flow, { env: Object.assign({ item: null, path: [], type: 'query' }, flow.env) }));
        }
        destroy() {
            if (this.isStarted) {
                throw new Error(`Started asketic tracker ${this.id} cant be destroyed.`);
            }
            super.destroy();
        }
    };
}
exports.default = mixin;
exports.mixin = mixin;
const MixedAsketicTracker = mixin(node_1.Node, tracker_1.Tracker);
exports.MixedAsketicTracker = MixedAsketicTracker;
class AsketicTracker extends MixedAsketicTracker {
}
exports.AsketicTracker = AsketicTracker;
//# sourceMappingURL=asketic-tracker.js.map