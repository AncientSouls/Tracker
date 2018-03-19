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
const node_1 = require("ancient-mixins/lib/node");
const tracker_1 = require("./tracker");
const asket_1 = require("ancient-asket/lib/asket");
function mixin(superClass, trackerClass) {
    return class AsketicTracker extends superClass {
        constructor(...args) {
            super(...args);
            this.trackerClass = trackerClass;
            this.on('destroyed', () => this.unsubscribe());
        }
        queryResolver() {
            const resolver = flow => new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (!flow.data) {
                    const { tracker, data } = yield this.schemaResolver(flow);
                    if (tracker && data) {
                        const parent = flow.env.parent;
                        const path = [...flow.env.path, flow.key];
                        this.emit('tracked', { flow, tracker, path });
                        this.on('unsubscribed', () => {
                            tracker.destroy();
                        });
                        tracker.on('destroyed', () => {
                            this.emit('untracked', { flow, tracker, path });
                        });
                        tracker.on('added', ({ id, changed, data, oldIndex, newIndex, }) => __awaiter(this, void 0, void 0, function* () {
                            const results = yield asket_1.asket({
                                resolver, data,
                                query: { schema: flow.schema },
                                env: Object.assign({}, flow.env, { id, path: [...path, id] }),
                            });
                            this.emit('added', {
                                id, changed, oldIndex, newIndex, tracker,
                                flow, path,
                                data: results,
                            });
                        }));
                        tracker.on('changed', ({ id, changed, data, oldIndex, newIndex, }) => __awaiter(this, void 0, void 0, function* () {
                            const results = yield asket_1.asket({
                                resolver, data,
                                query: { schema: flow.schema },
                                env: Object.assign({}, flow.env, { id, path: [...path, id] }),
                            });
                            this.emit('changed', {
                                id, changed, oldIndex, newIndex, tracker,
                                flow, path,
                                data: results,
                            });
                        }));
                        tracker.on('removed', ({ id, changed, oldIndex, newIndex, }) => __awaiter(this, void 0, void 0, function* () {
                            this.emit('removed', {
                                id, changed, oldIndex, newIndex, tracker,
                                flow, path,
                            });
                        }));
                        if (parent) {
                            parent.on('destroyed', () => tracker.destroy());
                            parent.on('removed', ({ id }) => id === flow.env.id && tracker.destroy());
                            parent.on('changed', ({ id }) => id === flow.env.id && tracker.destroy());
                        }
                        return resolve(Object.assign({}, flow, { data, env: Object.assign({}, flow.env, { path, parent: tracker }) }));
                    }
                }
                return resolve(Object.assign({}, flow, { env: Object.assign({}, flow.env, { path: [...flow.env.path, flow.key] }) }));
            }));
            return resolver;
        }
        resubscribe(query, schemaResolver) {
            return __awaiter(this, void 0, void 0, function* () {
                this.schemaResolver = schemaResolver;
                const data = yield asket_1.asket({
                    query,
                    resolver: this.queryResolver(),
                    env: {
                        id: null,
                        parent: null,
                        path: [],
                        type: 'query',
                    },
                });
                this.emit('subscribed', { data, tracker: this });
                return data;
            });
        }
        unsubscribe() {
            this.emit('unsubscribed', { tracker: this });
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