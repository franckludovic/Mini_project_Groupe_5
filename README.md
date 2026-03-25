# sdpkg - Software Development Package Manager

**sdpkg** is a custom CLI-based package manager designed for managing Node.js projects. It simplifies dependency management by providing commands to initialize projects, install/remove packages, update versions, and perform security audits. 

It is designed to be compatible with both **npm** (`package-lock.json`) and **yarn** (`yarn.lock`).

### Group members :

1. Tankeu Ndosse franck Direct Entry
2. Mbiangoup II Ngoba Esperalda Reine
3. Fongang Grace
4. Tah Estavet
5. Djou Joan
6. Ndifor Felicity 

### Prerequisites
- [Node.js] (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (to install internal dependencies)

### Installation
1. Clone the repository to your local machine.
2. Navigate to the project root and install the required dependencies:
   ```bash
   npm install
   ```
3. (Optional) Link the CLI globally to use it as a command:
   ```bash
   npm link
   ```
   with it  you can use it anywhere in your computer on any terminal just typing **sdpkg** removing the need to put the file path like ***/**/**/sdpkg

---

## Authentication System

When you launch `sdpkg` without arguments, you will find an authentication menu:
- **Sign Up**: Create a new account. Your credentials are saved permanently in `src/data/users.json`.
- **Login**: Verify your credentials to access the main menu.


## Interactive Main Menu

Running `sdpkg` without arguments opens the **Main Menu**, where you can navigate through all features using your arrow keys:
- **Initialize Project**: Set up your `package.json`.
- **Install Dependency**: Submenu to install all deps or search for a new one.
- **List Packages**: View your dependency tree.
- **Remove Package**: Interactive package removal.
- **Update Package**: Easily update to the latest version.
- **Security Audit**: Run a scan for vulnerabilities.
- **Exit**: Safely close and clear your session.


## Available Commands

You can run these commands using `node bin/sdpkg.js <command>` (or just `sdpkg <command>` if linked).

### 1. Initialize Project
Creates a `package.json` file by asking interactive questions.
```bash
node bin/sdpkg.js init
```

### 2. Login / Sign Up
Interactive authentication flow.
```bash
node bin/sdpkg.js login
```

### 3. Install Dependency
Downloads a package from the npm registry and adds it to your project.
```bash
node bin/sdpkg.js install [package-name]
```

### 4. Remove Dependency
Uninstalls a package and updates manifest files.
```bash
node bin/sdpkg.js remove <package-name>
```

### 5. List Dependencies
Displays a color-coded tree of all installed packages and their versions.
```bash
node bin/sdpkg.js list
```

### 6. Update Dependency
Checks for the latest version of a package and performs an update.
```bash
node bin/sdpkg.js update <package-name>
```

### 7. Security Audit
Scans your project for known vulnerabilities (mock implementation).
```bash
node bin/sdpkg.js audit
```

---

## Professional Enhancements
- **Interactive CLI**: Powered by `inquirer` for a smooth user experience.
- **Color Output**: Integrated `chalk` for readable success and error messages.
- **Progress Indicators**: Uses `ora` spinners for long-running tasks like downloads.
