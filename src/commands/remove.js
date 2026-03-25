const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

const inquirer = require('inquirer');

module.exports = async (pkgName) => {
  if (!pkgName) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter package name to remove:',
        validate: input => input.length > 0 || 'Package name is required'
      }
    ]);
    pkgName = name;
  }

  const spinner = ora(`Removing ${pkgName}...`).start();

  try {
    const pkgJsonPath = path.join(process.cwd(), 'package.json');
    const pkgJson = await fs.readJson(pkgJsonPath);

    if (pkgJson.dependencies && pkgJson.dependencies[pkgName]) {
      delete pkgJson.dependencies[pkgName];
      await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
    }

    const nodeModulesPath = path.join(process.cwd(), 'node_modules', pkgName);
    if (await fs.pathExists(nodeModulesPath)) {
      await fs.remove(nodeModulesPath);
    }

    // Simplified lockfile removal (just removing from npm/yarn lock if they exist)
    const npmLockPath = path.join(process.cwd(), 'package-lock.json');
    if (await fs.pathExists(npmLockPath)) {
      const lockData = await fs.readJson(npmLockPath);
      if (lockData.dependencies) delete lockData.dependencies[pkgName];
      if (lockData.packages) {
        delete lockData.packages[`node_modules/${pkgName}`];
        if (lockData.packages[''] && lockData.packages[''].dependencies) {
          delete lockData.packages[''].dependencies[pkgName];
        }
      }
      await fs.writeJson(npmLockPath, lockData, { spaces: 2 });
    }

    spinner.succeed(chalk.green(`Removed ${pkgName}`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to remove ${pkgName}: ${error.message}`));
  }
};
