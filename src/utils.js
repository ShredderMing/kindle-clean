const groupBy = fn => list => {
  const r = {};
  list.forEach(item => {
    const type = fn(item);
    (r[type] || (r[type] = [])).push(item);
  });
  return r;
};

const differenceBy = fn => (lst1, lst2) =>
  lst1.filter(m => lst2.findIndex(n => fn(m) === fn(n)) === -1);

export { groupBy, differenceBy };
