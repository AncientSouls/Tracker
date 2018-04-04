"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const interval_adapter_1 = require("./interval-adapter");
const docs_adapter_1 = require("./docs-adapter");
const tracks_adapter_1 = require("./tracks-adapter");
const interval_asketic_tracker_1 = require("./interval-asketic-tracker");
describe('AncientSouls/Tracker:', () => {
    interval_adapter_1.default();
    docs_adapter_1.default();
    tracks_adapter_1.default();
    interval_asketic_tracker_1.default();
});
//# sourceMappingURL=index.js.map