const fs = require('fs')

const targetFile = process.argv[2];
const pattern = process.argv[3];
const replacement = process.argv[4];
console.log(`Replace ${pattern} with ${replacement} in ${targetFile}`);

fs.readFile(targetFile, 'utf8', function (err,data) {
  if (err) {
    return console.err(err);
  }
  const result = data.replace(pattern, replacement);

  fs.writeFile(targetFile, result, 'utf8', function (err) {
     if (err) return console.err(err);
  });
});
