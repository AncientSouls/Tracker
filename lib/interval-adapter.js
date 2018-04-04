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
const adapter_1 = require("./adapter");
function mixin(superClass) {
    return class IntervalAdapter extends superClass {
        starting() {
            return __awaiter(this, void 0, void 0, function* () {
                this.client.intervalInstance = setInterval(() => this.iteration(), this.client.interval || 10);
            });
        }
        iteration() {
            _.each(this.items, tracking => this.override(tracking));
        }
        stopping() {
            return __awaiter(this, void 0, void 0, function* () {
                clearInterval(this.client.intervalInstance);
            });
        }
    };
}
exports.mixin = mixin;
exports.MixedIntervalAdapter = mixin(adapter_1.Adapter);
class IntervalAdapter extends exports.MixedIntervalAdapter {
}
exports.IntervalAdapter = IntervalAdapter;
//# sourceMappingURL=interval-adapter.js.map