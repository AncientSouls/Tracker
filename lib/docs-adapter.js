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
const adapter_1 = require("./adapter");
function mixin(superClass) {
    return class DocsAdapter extends superClass {
        add(data, newIndex, item) {
            return __awaiter(this, void 0, void 0, function* () {
                yield item.tracker.add(yield this.parse(data, newIndex, item));
            });
        }
        change(data, newIndex, item) {
            return __awaiter(this, void 0, void 0, function* () {
                yield item.tracker.change(yield this.parse(data, newIndex, item));
            });
        }
        remove(id, item) {
            return __awaiter(this, void 0, void 0, function* () {
                yield item.tracker.remove({
                    id, newIndex: -1, tracker: item.tracker,
                });
            });
        }
    };
}
exports.mixin = mixin;
exports.MixedDocsAdapter = mixin(adapter_1.Adapter);
class DocsAdapter extends exports.MixedDocsAdapter {
}
exports.DocsAdapter = DocsAdapter;
//# sourceMappingURL=docs-adapter.js.map