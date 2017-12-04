var fs = require('fs');
var path = require('path');

const walk = dir =>
  fs
    .readdirSync(dir)
    .filter(f => {
      return f && f[0] !== '.';
    })
    .map(f => {
      const p = path.join(dir, f),
        stat = fs.statSync(p),
        pathObj = path.parse(p);
      if (stat.isDirectory()) {
        if (pathObj.ext === '.sdr') {
          return {
            type: 'sdr',
            name: pathObj.name,
            ext: '.sdr',
            base: pathObj.base,
            path: p
          };
        }
        return {
          type: 'folder',
          name: pathObj.name,
          ext: '',
          base: pathObj.base,
          path: p,
          children: walk(p)
        };
      }
      return {
        type: 'file',
        name: pathObj.name,
        ext: pathObj.ext,
        base: pathObj.base,
        path: p
      };
    });

const scan = dir => ({
  name: path.parse(dir).name,
  type: 'folder',
  path: dir,
  children: walk(dir)
});

module.exports = scan;
