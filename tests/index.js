"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const tracker_1 = require("./tracker");
const sqlite_tracker_1 = require("./sqlite-tracker");
describe('AncientSouls/Tracker:', () => {
    tracker_1.default();
    sqlite_tracker_1.default();
});
//# sourceMappingURL=index.js.map