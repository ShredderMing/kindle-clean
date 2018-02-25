#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const yesno = require('yesno');
import scan from './scan.js';
import { groupBy, differenceBy } from './utils.js';

const pkg = require(path.join(__dirname, 'package.json'));

const groupByType = groupBy(f => {
  if (f.type === 'sdr') {
    return 'sdrs';
  }
  if (f.type === 'file') {
    return 'files';
  }
  if (f.type === 'folder') {
    return 'folders';
  }
  return 'unknown';
});

const differenceByName = differenceBy(f => f.name);

const findTrashSdrHelper = (tree, result) => {
  const list = tree.children;
  const { sdrs = [], files = [], folders = [] } = groupByType(list);
  Array.prototype.push.apply(result, differenceByName(sdrs, files));
  if (folders.length !== 0) {
    folders.forEach(f => findTrashSdrHelper(f, result));
  }
};

const findTrashSdr = tree => {
  const result = [];
  findTrashSdrHelper(tree, result);
  return result;
};

program
  .version(pkg.version)
  .arguments('<dir>')
  .action(dir => {
    trashSdrs = findTrashSdr(scan(dir));
    trashSdrs.forEach(f => {
      console.log('-----------------------');
      console.log('name: ', f.base);
      console.log('path: ', f.path);
      console.log('-----------------------');
    });
    if (trashSdrs.length === 0) {
      console.log('Your kindle is clean.');
      console.log('Bye!');
      process.exit(0);
    } else {
      yesno.ask(
        'Are you sure you want to delete all these files?[Y/n]',
        true,
        ok => {
          if (ok) {
            Promise.all(trashSdrs.map(f => fs.remove(f.path)))
              .then(() => {
                console.log('success!');
                process.exit(0);
              })
              .catch(e => {
                console.error(e);
                process.exit(1);
              });
          } else {
            console.log('Bye!');
            process.exit(0);
          }
        }
      );
    }
  })
  .parse(process.argv);
