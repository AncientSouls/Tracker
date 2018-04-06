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
            this.isActive = false;
            this.actions = [];
        }
        init(flow) {
            if (this.isStarted) {
                throw new Error(`Started tracker ${this.id} cant be inited.`);
            }
            this._flow = flow;
        }
        subscribe() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!_.isObject(this.flow)) {
                    throw new Error(`Flow must be Asket TQueryFlow but: ${this.flow}`);
                }
                if (this.isStarted) {
                    throw new Error(`Started asketic tracker ${this.id} cant be subscribed.`);
                }
                this.isStarted = true;
                this.emit('subscribe', { asketicTracker: this });
                const result = yield this.asket(this.flowRoot(this._flow));
                this.emit('subscribed', { result, asketicTracker: this });
                return result;
            });
        }
        unsubscribe() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isStarted) {
                    throw new Error(`Not started asketic tracker ${this.id} cant be unsubscribed.`);
                }
                this.isStarted = false;
                this.emit('unsubscribe', { asketicTracker: this });
                const trackers = _.map(this.trackers, t => this.untrack(t));
                yield Promise.all(trackers);
                this.emit('unsubscribed', { asketicTracker: this });
                return this;
            });
        }
        asket(flow) {
            const resolver = flow.resolver;
            flow.resolver = (flow) => __awaiter(this, void 0, void 0, function* () {
                const f = yield resolver(flow);
                return f;
            });
            return asket_1.asket(flow);
        }
        getDataPath(path) {
            const result = [];
            let p;
            let actualIndex;
            for (p = 0; p < path.length; p++) {
                if (path[p].env.type === 'root')
                    continue;
                else if (path[p].env.type === 'item') {
                    actualIndex = path[p].env.tracker.ids.indexOf(path[p].env.item.id);
                    result.push(actualIndex, path[p].key);
                }
                else
                    result.push(path[p].key);
            }
            return result;
        }
        addAction(action) {
            this.actions.push(action);
            this.nextAction();
        }
        nextAction() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isActive && this.actions.length) {
                    this.isActive = true;
                    const action = this.actions.shift();
                    yield action();
                    this.isActive = false;
                    this.nextAction();
                }
            });
        }
        flow(prevFlow) {
            return Object.assign({}, prevFlow, { env: Object.assign({}, prevFlow.env) });
        }
        flowTracker(prevFlow, tracker) {
            return __awaiter(this, void 0, void 0, function* () {
                const flow = this.flowItems(prevFlow);
                const parentTracker = flow.env.tracker;
                flow.env.tracker = tracker;
                flow.data = [];
                const trackerAddedListener = item => flow.data.splice(item.newIndex, 0, item);
                tracker.on('added', trackerAddedListener);
                yield tracker.subscribe();
                tracker.off('added', trackerAddedListener);
                const flowItems = this.flowItems(flow);
                tracker.on('added', (item) => {
                    this.addAction(() => __awaiter(this, void 0, void 0, function* () {
                        const flow = Object.assign({}, flowItems, { data: item, path: [] });
                        const result = yield this.asket(flow);
                        this.emit('added', {
                            item, result, flow, asketicTracker: this,
                            path: this.getDataPath(flowItems.path),
                        });
                    }));
                });
                tracker.on('changed', (item) => {
                    this.addAction(() => __awaiter(this, void 0, void 0, function* () {
                        const flow = Object.assign({}, flowItems, { data: item, path: [] });
                        const result = yield this.asket(flow);
                        this.emit('changed', {
                            item, result, flow, asketicTracker: this,
                            path: this.getDataPath(flowItems.path),
                        });
                    }));
                });
                tracker.on('removed', (item) => __awaiter(this, void 0, void 0, function* () {
                    this.addAction(() => __awaiter(this, void 0, void 0, function* () {
                        this.emit('removed', {
                            item, flow, asketicTracker: this,
                            path: this.getDataPath(flowItems.path),
                        });
                    }));
                }));
                if (parentTracker) {
                    parentTracker.once('destroyed', () => {
                        if (tracker.isStarted) {
                            tracker.unsubscribe();
                            tracker.destroy();
                        }
                    });
                    parentTracker.on('removed', ({ id }) => {
                        if (tracker.isStarted && id === flow.env.item.id) {
                            tracker.unsubscribe();
                            tracker.destroy();
                        }
                    });
                    parentTracker.on('changed', ({ id }) => {
                        if (tracker.isStarted && id === flow.env.item.id) {
                            tracker.unsubscribe();
                            tracker.destroy();
                        }
                    });
                }
                return flowItems;
            });
        }
        flowItems(prevFlow) {
            const flow = this.flow(prevFlow);
            flow.env.type = 'items';
            return flow;
        }
        flowRoot(prevFlow) {
            const flow = this.flow(prevFlow);
            flow.env.type = 'root';
            return flow;
        }
        flowItem(prevFlow) {
            const flow = this.flow(prevFlow);
            flow.env.item = flow.data;
            flow.data = flow.data.data;
            flow.env.type = 'item';
            return flow;
        }
        flowValue(prevFlow) {
            const flow = this.flow(prevFlow);
            flow.env.type = 'value';
            return flow;
        }
    };
}
exports.mixin = mixin;
exports.MixedAsketicTracker = mixin(node_1.Node, tracker_1.Tracker);
class AsketicTracker extends exports.MixedAsketicTracker {
}
exports.AsketicTracker = AsketicTracker;
//# sourceMappingURL=asketic-tracker.js.map