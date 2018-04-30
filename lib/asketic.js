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
function mixin(superClass) {
    return class Asketic extends superClass {
        constructor() {
            super(...arguments);
            this.processing = false;
            this.waiting = [];
        }
        getDataPath(path) {
            const result = [];
            let p;
            let actualIndex;
            for (p = 0; p < path.length; p++) {
                if (path[p].env.type === 'root')
                    continue;
                else if (path[p].env.type === 'item') {
                    actualIndex = path[p].env.tracker.indexes[path[p].env.item.id];
                    if (typeof (actualIndex) !== 'number')
                        return;
                    result.push(actualIndex, path[p].key);
                }
                else
                    result.push(path[p].key);
            }
            return result;
        }
        get() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.processing) {
                    this.processing = true;
                    const waiting = this.waiting;
                    this.waiting = [];
                    const changes = [];
                    let w;
                    let f;
                    for (w = waiting.length - 1; w >= 0; w--) {
                        for (f in waiting[w]) {
                            if (!waiting[w][f].env.tracker.isDestroyed) {
                                const dataPath = this.getDataPath(waiting[w][f].path);
                                if (dataPath) {
                                    const trackerChanges = yield waiting[w][f].env.tracker.get((change) => __awaiter(this, void 0, void 0, function* () {
                                        const result = yield this.next(Object.assign({}, waiting[w][f], { data: change.item, path: [] }));
                                        change.item = result.data;
                                        return change;
                                    }));
                                    if (trackerChanges.length) {
                                        changes.push({
                                            path: dataPath,
                                            changes: trackerChanges,
                                        });
                                    }
                                }
                            }
                        }
                    }
                    this.processing = false;
                    return changes;
                }
                this.emit('getted', {
                    changes: [],
                    asletic: this,
                });
                return [];
            });
        }
        set(flow) {
            if (!this.waiting[flow.env.tracker.id]) {
                this.waiting[flow.env.path.length - 1] = this.waiting[flow.env.path.length - 1] || {};
                this.waiting[flow.env.path.length - 1][flow.env.tracker.id] = flow;
                this.emit('setted', { asketic: this });
            }
        }
        next(flow) {
            flow.env = flow.env || {};
            flow.env.path = flow.env.path || [];
            flow.env.type = flow.env.type || 'root';
            return flow.next(flow);
        }
        flowTracker(prevFlow, tracker) {
            return __awaiter(this, void 0, void 0, function* () {
                const flow = this.flowItems(prevFlow);
                const parent = _.last(flow.env.path);
                flow.env.path = [...flow.env.path, flow];
                flow.env.tracker = tracker;
                yield tracker.get();
                flow.data = tracker.current;
                tracker.on('setted', () => this.set(flow));
                if (flow.env.parentTracker) {
                    flow.env.parentTracker.once('destroyed', () => {
                        tracker.destroy();
                    });
                    flow.env.parentTracker.on('removed', ({ change: { id } }) => {
                        if (id === flow.env.item.id)
                            tracker.destroy();
                    });
                    flow.env.parentTracker.on('changed', ({ id }) => {
                        if (id === flow.env.item.id)
                            tracker.destroy();
                    });
                }
                this.once('destroyed', () => {
                    tracker.destroy();
                });
                return flow;
            });
        }
        flowItems(flow) {
            return Object.assign({}, flow, { env: Object.assign({}, flow.env, { type: 'items' }) });
        }
        flowItem(flow) {
            return Object.assign({}, flow, { data: flow.data, env: Object.assign({}, flow.env, { type: 'item', item: flow.data }) });
        }
        flowRoot(flow) {
            return Object.assign({}, flow, { env: Object.assign({}, flow.env, { type: 'root' }) });
        }
        flowValue(flow) {
            return Object.assign({}, flow, { env: Object.assign({}, flow.env, { type: 'value' }) });
        }
    };
}
exports.mixin = mixin;
exports.MixedAsketic = mixin(node_1.Node);
class Asketic extends exports.MixedAsketic {
}
exports.Asketic = Asketic;
//# sourceMappingURL=asketic.js.map