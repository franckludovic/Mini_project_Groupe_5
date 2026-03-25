const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

module.exports = async () => {
  const pkgJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!(await fs.pathExists(pkgJsonPath))) {
    console.error(chalk.red('No package.json found.'));
    return;
  }

  try {
    const pkgJson = await fs.readJson(pkgJsonPath);
    const deps = pkgJson.dependencies || {};
    
    console.log(chalk.bold.blue(`${pkgJson.name}@${pkgJson.version}`));
    console.log(chalk.gray(process.cwd()));
    
    if (Object.keys(deps).length === 0) {
      console.log(chalk.yellow('No dependencies installed.'));
      return;
    }

    Object.entries(deps).forEach(([name, version], index, array) => {
      const isLast = index === array.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      
      // Try to get the actual installed version from node_modules
      let actualVersion = version;
      try {
        const depPkgJson = fs.readJsonSync(path.join(process.cwd(), 'node_modules', name, 'package.json'));
        actualVersion = depPkgJson.version;
      } catch (e) {
        actualVersion = chalk.red('missing');
      }

      console.log(`${chalk.gray(prefix)}${name}@${chalk.green(actualVersion)}`);
    });
  } catch (error) {
    console.error(chalk.red('Error listing packages:'), error.message);
  }
};
