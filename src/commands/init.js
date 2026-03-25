const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

module.exports = async () => {
  console.log(chalk.cyan('Initializing a new project...'));
  
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Package name:',
      default: path.basename(process.cwd())
    },
    {
      type: 'input',
      name: 'version',
      message: 'Version:',
      default: '1.0.0'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      default: ''
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:',
      default: ''
    },
    {
      type: 'input',
      name: 'license',
      message: 'License:',
      default: 'MIT'
    }
  ];

  try {
    const answers = await inquirer.prompt(questions);
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'package.json already exists. Overwrite?',
          default: false
        }
      ]);
      if (!overwrite) {
        console.log(chalk.yellow('Initialization aborted.'));
        return;
      }
    }

    const pkgContent = {
      ...answers,
      main: 'index.js',
      scripts: {
        test: 'echo "Error: no test specified" && exit 1'
      },
      dependencies: {}
    };

    await fs.writeJson(packageJsonPath, pkgContent, { spaces: 2 });
    console.log(chalk.green('\nSuccess! package.json created.'));
  } catch (error) {
    console.error(chalk.red('Error initializing project:'), error.message);
  }
};
