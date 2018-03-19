import * as _ from 'lodash';
const chance = require('chance').Chance();

const stress = (
  insert,
  update,
  remove,
  times = 1000,
  chances = [2,3,1],
) => {
  let counter = 0;
  _.times(times, () => {
    const action = chance.weighted(
      ['insert','update','remove'],
      chances,
    );
    if (action === 'insert') {
      counter++;
      return insert();
    }
    if (action === 'update' && counter) {
      return update();
    }
    if (action === 'remove' && counter) {
      counter--;
      return remove();
    }
    insert();
  });
};

export {
  stress,
};
