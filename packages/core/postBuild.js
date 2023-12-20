const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'dist/node');
const targetDir = path.join(__dirname, 'dist/types');

const moveDtsFiles = (source, target) => {
  fs.readdirSync(source, { withFileTypes: true }).forEach((dirent) => {
    const sourcePath = path.join(source, dirent.name);
    const targetPath = path.join(target, dirent.name);

    if (dirent.isDirectory()) {
      // Create directory in target if it doesn't exist
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath);
      }
      // Recurse into the directory
      moveDtsFiles(sourcePath, targetPath);
    } else if (dirent.isFile() && dirent.name.endsWith('.d.ts')) {
      // Move .d.ts file
      fs.renameSync(sourcePath, targetPath);
    }
  });
};

moveDtsFiles(sourceDir, targetDir);
