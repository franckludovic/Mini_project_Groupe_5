#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const pkg = require('../package.json');
const login = require('../src/commands/login');

async function runInteractiveMenu() {
  console.log(chalk.bold.blue('\nWelcome to sdpkg - Software Development Package Manager\n'));

  // 1. Initial Auth Menu
  let authenticated = false;
  while (!authenticated) {
    const { authAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'authAction',
        message: 'Authentication:',
        choices: [
          { name: 'Login', value: 'login' },
          { name: 'Sign Up', value: 'signup' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    if (authAction === 'exit') {
      console.log(chalk.yellow('Goodbye!'));
      process.exit(0);
    }

    authenticated = await login(authAction);
  }

  // 2. Main Menu Loop
  let running = true;
  while (running) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Main Menu:',
        choices: [
          { name: 'Initialize Project', value: 'init' },
          { name: 'Install Dependency', value: 'install' },
          { name: 'List Packages', value: 'list' },
          { name: 'Remove Package', value: 'remove' },
          { name: 'Update Package', value: 'update' },
          { name: 'Security Audit', value: 'audit' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    if (action === 'exit') {
      // 3. Reset Session on Exit
      if (await fs.pathExists(login.CONFIG_FILE)) {
        await fs.remove(login.CONFIG_FILE);
      }
      console.log(chalk.yellow('Session cleared. Goodbye!'));
      running = false;
      break;
    }

    try {
      await require(`../src/commands/${action}`)();
      console.log('\n' + chalk.gray('---') + '\n');
    } catch (err) {
      console.error(chalk.red(`Error executing ${action}:`), err.message);
    }
  }
}

// Check if running with arguments
if (process.argv.slice(2).length > 0) {
  // Direct CLI Path
  program
    .name('sdpkg')
    .description('Software Development Package Manager')
    .version(pkg.version);

  program
    .command('init')
    .description('Initialize a new project')
    .action(() => require('../src/commands/init')());

  program
    .command('install [package]')
    .description('Install a dependency')
    .alias('i')
    .action((pkgName) => require('../src/commands/install')(pkgName));

  program
    .command('remove <package>')
    .description('Remove a dependency')
    .alias('r')
    .action((pkgName) => require('../src/commands/remove')(pkgName));

  program
    .command('list')
    .description('List installed packages')
    .alias('ls')
    .action(() => require('../src/commands/list')());

  program
    .command('update [package]')
    .description('Update dependencies')
    .action((pkgName) => require('../src/commands/update')(pkgName));

  program
    .command('audit')
    .description('Perform a security audit')
    .action(() => require('../src/commands/audit')());

  program
    .command('login [mode]')
    .description('Login or Sign up')
    .action((mode) => require('../src/commands/login')(mode));

  program.parse(process.argv);
} else {
  // Interactive Path
  runInteractiveMenu().catch(err => {
    console.error(chalk.red('Fatal error:'), err.message);
    process.exit(1);
  });
}
