const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const tar = require('tar');
const ora = require('ora');
const chalk = require('chalk');
const inquirer = require('inquirer');
const LockfileManager = require('../utils/LockfileManager');

module.exports = async (pkgName) => {
  if (!pkgName) {
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Install options:',
        choices: [
          { name: 'Install all dependencies from package.json', value: 'all' },
          { name: 'Install a specific package', value: 'specific' }
        ]
      }
    ]);

    if (mode === 'all') {
      const pkgJsonPath = path.join(process.cwd(), 'package.json');
      if (!(await fs.pathExists(pkgJsonPath))) {
        console.error(chalk.red('No package.json found. Use sdpkg init first.'));
        return;
      }
      const pkgJson = await fs.readJson(pkgJsonPath);
      const deps = pkgJson.dependencies || {};
      console.log(chalk.cyan('Installing all dependencies...'));
      for (const [name, version] of Object.entries(deps)) {
        await installPackage(name, version);
      }
      return;
    } else {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter package name to install:',
          validate: input => input.length > 0 || 'Package name is required'
        }
      ]);
      pkgName = name;
    }
  }

  await installPackage(pkgName);
};

async function installPackage(pkgName, requestedVersion = 'latest') {
  const spinner = ora(`Installing ${pkgName}...`).start();
  
  try {
    // 1. Resolve version and tarball URL
    const { data: pkgData } = await axios.get(`https://registry.npmjs.org/${pkgName}`);
    const version = requestedVersion === 'latest' ? pkgData['dist-tags'].latest : requestedVersion;
    const tarballUrl = pkgData.versions[version].dist.tarball;

    // 2. Download tarball
    const tempDir = path.join(process.cwd(), '.sdpkg-cache');
    await fs.ensureDir(tempDir);
    const tarPath = path.join(tempDir, `${pkgName}-${version}.tgz`);
    
    const response = await axios({
      url: tarballUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(tarPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // 3. Extract to node_modules
    const targetDir = path.join(process.cwd(), 'node_modules', pkgName);
    await fs.ensureDir(targetDir);
    
    await tar.x({
      file: tarPath,
      cwd: targetDir,
      strip: 1 // Skip the 'package' root folder in the tarball
    });

    // 4. Update package.json
    const pkgJsonPath = path.join(process.cwd(), 'package.json');
    const pkgJson = await fs.readJson(pkgJsonPath);
    if (!pkgJson.dependencies) pkgJson.dependencies = {};
    pkgJson.dependencies[pkgName] = `^${version}`;
    await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });

    // 5. Update Lockfile
    const lockfileManager = new LockfileManager(process.cwd());
    await lockfileManager.updateLockfile(pkgName, version);

    // Cleanup
    await fs.remove(tarPath);
    
    spinner.succeed(chalk.green(`Installed ${pkgName}@${version}`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to install ${pkgName}: ${error.message}`));
  }
}
