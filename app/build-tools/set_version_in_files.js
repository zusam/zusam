const fs = require('fs')

let version = "unknown";

fs.readFile('./package.json', 'utf8', (err, data) => {
  if (err) {
    console.err(err);
    return;
  }
  const json_data = JSON.parse(data);
  version = json_data["version"];

  process.argv.slice(2).forEach(targetFile => {
    console.log(`Replace @VERSION@ with ${version} in ${targetFile}`);
    fs.readFile(targetFile, 'utf8', (err, data) => {
      if (err) {
        console.err(err);
        return;
      }
      const result = data.replace('@VERSION@', version);

      fs.writeFile(targetFile, result, 'utf8', function (err) {
         if (err) {
           console.err(err);
           return;
         }
      });
    });
  });
});
