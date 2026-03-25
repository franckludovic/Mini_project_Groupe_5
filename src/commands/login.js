const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

const CONFIG_FILE = path.join(os.homedir(), '.dmcconf.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

async function getUsers() {
  if (!(await fs.pathExists(USERS_FILE))) {
    await fs.ensureDir(path.dirname(USERS_FILE));
    await fs.writeJson(USERS_FILE, []);
    return [];
  }
  return await fs.readJson(USERS_FILE);
}

async function saveUsers(users) {
  await fs.writeJson(USERS_FILE, users, { spaces: 2 });
}

module.exports = async (mode = 'login') => {
  if (mode === 'login') {
    console.log(chalk.cyan('\n--- Login to dmc ---'));
  } else {
    console.log(chalk.cyan('\n--- Sign Up for dmc ---'));
  }
  
  const questions = [
    {
      type: 'input',
      name: 'username',
      message: 'Username:',
      validate: (input) => input.length > 0 || 'Username is required'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      mask: '*',
      validate: (input) => input.length > 0 || 'Password is required'
    }
  ];

  try {
    const answers = await inquirer.prompt(questions);
    const users = await getUsers();

    if (mode === 'login') {
      const user = users.find(u => u.username === answers.username && u.password === answers.password);
      if (!user) {
        console.log(chalk.red('\nInvalid username or password.'));
        const { signup } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'signup',
            message: 'Would you like to register instead?',
            default: true
          }
        ]);
        if (signup) return await module.exports('signup');
        return false;
      }

      // Create session
      const token = Buffer.from(`${answers.username}:${Date.now()}`).toString('base64');
      await fs.writeJson(CONFIG_FILE, { 
        username: answers.username,
        token: token,
        lastLogin: new Date().toISOString()
      }, { spaces: 2 });

      console.log(chalk.green(`\nWelcome back, ${answers.username}!`));
      return true;

    } else {
      // Sign Up
      if (users.find(u => u.username === answers.username)) {
        console.log(chalk.red('\nUsername already exists. Please choose another or login.'));
        return false;
      }

      users.push({
        username: answers.username,
        password: answers.password,
        createdAt: new Date().toISOString()
      });

      await saveUsers(users);
      console.log(chalk.green(`\nAccount created successfully for ${answers.username}!`));
      console.log(chalk.yellow('Please log in with your new credentials.'));
      return await module.exports('login');
    }

  } catch (error) {
    console.error(chalk.red('\nAuthentication failed:'), error.message);
    return false;
  }
};

module.exports.CONFIG_FILE = CONFIG_FILE;
