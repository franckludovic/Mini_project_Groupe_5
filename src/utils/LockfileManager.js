const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class LockfileManager {
  constructor(projectDir) {
    this.projectDir = projectDir;
    this.pkgJsonPath = path.join(projectDir, 'package.json');
    this.npmLockPath = path.join(projectDir, 'package-lock.json');
    this.yarnLockPath = path.join(projectDir, 'yarn.lock');
  }

  async detectManager() {
    if (await fs.pathExists(this.yarnLockPath)) {
      return 'yarn';
    }
    return 'npm';
  }

  async updateLockfile(pkgName, version) {
    const manager = await this.detectManager();
    if (manager === 'yarn') {
      await this.updateYarnLock(pkgName, version);
    } else {
      await this.updateNpmLock(pkgName, version);
    }
  }

  async updateNpmLock(pkgName, version) {
    let lockData = {
      name: path.basename(this.projectDir),
      version: '1.0.0',
      lockfileVersion: 2,
      requires: true,
      packages: {
        '': {
          dependencies: {}
        }
      },
      dependencies: {}
    };

    if (await fs.pathExists(this.npmLockPath)) {
      lockData = await fs.readJson(this.npmLockPath);
    }

    if (!lockData.packages['']) lockData.packages[''] = { dependencies: {} };
    lockData.packages[''].dependencies[pkgName] = version;

    const pkgPath = `node_modules/${pkgName}`;
    lockData.packages[pkgPath] = {
      version: version,
      resolved: `https://registry.npmjs.org/${pkgName}/-/${pkgName}-${version}.tgz`,
      integrity: 'sha512-dummy-integrity'
    };

    if (!lockData.dependencies) lockData.dependencies = {};
    lockData.dependencies[pkgName] = {
      version: version,
      resolved: `https://registry.npmjs.org/${pkgName}/-/${pkgName}-${version}.tgz`
    };

    await fs.writeJson(this.npmLockPath, lockData, { spaces: 2 });
    console.log(chalk.gray(`Updated package-lock.json for ${pkgName}@${version}`));
  }

  async updateYarnLock(pkgName, version) {

    let content = '';
    if (await fs.pathExists(this.yarnLockPath)) {
      content = await fs.readFile(this.yarnLockPath, 'utf8');
    }

    const entry = `\n"${pkgName}@^${version}":\n  version "${version}"\n  resolved "https://registry.npmjs.org/${pkgName}/-/${pkgName}-${version}.tgz"\n`;


    if (!content.includes(`"${pkgName}@`)) {
      content += entry;
    }

    await fs.writeFile(this.yarnLockPath, content);
    console.log(chalk.gray(`Updated yarn.lock for ${pkgName}@${version}`));
  }
}

module.exports = LockfileManager;
