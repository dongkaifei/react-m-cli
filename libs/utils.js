const fs = require('fs-extra');
const inquirer = require('inquirer');
const execa = require('execa');
const chalk = require('chalk');
const logger = console.log;
const config = require('./config');
const { logWithSpinner, stopSpinner } = require('./spinner');

// 执行终端命令
async function runCmd(command, args) {
    if (!args) {
        [command, ...args] = command.split(/\s+/)
    }
    return execa(command, args, { cwd: process.cwd() })
}

// 询问
async function toInquirer({
    message,
    choices
}) {
    const { action } = await inquirer.prompt([
        {
            name: 'action',
            type: 'list',
            message,
            choices
        }
    ])
    return action;
}

// 改变项目名称
async function modifyProName(targetDir, projectName) {
    logger('project name change start...');
    return new Promise((resolve, reject) => {
        const filePath = `${targetDir}/package.json`;
        // read
        fs.readJson(filePath)
            .then(packageObj => {
                packageObj.name = projectName;
                // write
                fs.writeJson(filePath, { ...packageObj }, { spaces: 2, EOL: '\r\n' })
                    .then(() => {
                        logger('project name is changed!');
                        resolve();
                    })
                    .catch(err => {
                        console.error(err);
                        reject(err);
                    })
            }).catch(err => {
                console.error(err);
                reject(err);
            });
    })
}

// clone git address
async function cloneProject(appName) {
    logWithSpinner(chalk.bgCyanBright(`🚀 git clone...`));
    const runResult = await runCmd('git', ['clone', config.reactPro, appName]);
    if (runResult.exitCode !== 0) {
        logger('❎', chalk.bgCyanBright(`cloned failed!`));
        return false;
    }
    stopSpinner();
    logger(chalk.green('✔'), chalk.bgCyanBright(`cloned success!`));
    // log(`📦  Installing ${chalk.cyan(packageName)}...`)
    return true;
}

// create a readme
async function generateReadme(appName, packageManager, targetDir) {
    const mdCtx = [
        `# ${appName}\n`,

        '## Project setup',

        '```',
        `${packageManager} install`,
        '```',

        `\n### Run`,
        '```',
        `${packageManager} start`,
        '```',

        `\n### Build`,
        '```',
        `${packageManager} build`,
        '```',

        ''
    ].join('\n');
    const filePath = `${targetDir}/README.md`;
    return fs.outputFileSync(filePath, mdCtx);
}

exports.runCmd = runCmd;
exports.toInquirer = toInquirer;
exports.modifyProName = modifyProName;
exports.cloneProject = cloneProject;
exports.generateReadme = generateReadme;