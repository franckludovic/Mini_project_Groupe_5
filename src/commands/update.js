const axios = require('axios');
const chalk = require('chalk');
const install = require('./install');

const inquirer = require('inquirer');

module.exports = async (pkgName) => {
  if (!pkgName) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter package name to update (or type "back"):',
        validate: input => input.length > 0 || 'Package name is required'
      }
    ]);
    if (name.toLowerCase() === 'back') return;
    pkgName = name;
  }

  try {
    const { data: pkgData } = await axios.get(`https://registry.npmjs.org/${pkgName}`);
    const latestVersion = pkgData['dist-tags'].latest;
    
    console.log(chalk.cyan(`Updating ${pkgName} to latest version (${latestVersion})...`));
    await install(pkgName);
  } catch (error) {
    console.error(chalk.red(`Failed to update ${pkgName}: ${error.message}`));
  }
};
