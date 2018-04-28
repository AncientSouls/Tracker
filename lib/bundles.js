"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dataToBundle(data) {
    return {
        path: [],
        type: 'set',
        value: data,
    };
}
exports.dataToBundle = dataToBundle;
function asketicChangesToBundles(asketicChanges) {
    const bundles = [];
    let ac;
    for (ac in asketicChanges) {
        let c;
        for (c in asketicChanges[ac].changes) {
            if (asketicChanges[ac].changes[c].oldIndex === -1) {
                bundles.push({
                    path: asketicChanges[ac].path,
                    type: 'splice',
                    deleteCount: 0,
                    start: asketicChanges[ac].changes[c].newIndex,
                    values: [asketicChanges[ac].changes[c].item],
                });
            }
            else if (asketicChanges[ac].changes[c].newIndex === -1) {
                bundles.push({
                    path: asketicChanges[ac].path,
                    type: 'splice',
                    deleteCount: 1,
                    start: asketicChanges[ac].changes[c].oldIndex,
                    values: [],
                });
            }
            else {
                if (asketicChanges[ac].changes[c].oldIndex !== asketicChanges[ac].changes[c].newIndex) {
                    bundles.push({
                        path: asketicChanges[ac].path,
                        type: 'move',
                        from: asketicChanges[ac].changes[c].oldIndex,
                        to: asketicChanges[ac].changes[c].newIndex,
                    });
                }
                if (asketicChanges[ac].changes[c].changed) {
                    bundles.push({
                        path: [...asketicChanges[ac].path, asketicChanges[ac].changes[c].newIndex],
                        type: 'set',
                        value: asketicChanges[ac].changes[c].item,
                    });
                }
            }
        }
    }
    return bundles;
}
exports.asketicChangesToBundles = asketicChangesToBundles;
//# sourceMappingURL=bundles.js.map