const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const inquirer = require('inquirer');
const execa = require('execa');
const logger = console.log;

// 询问是否覆盖当前文件夹
async function isOverwrite() {
    const { action } = await inquirer.prompt([
        {
            name: 'action',
            type: 'list',
            message: `Target directory already exists. Pick an action:`,
            choices: [
                { name: 'Overwrite', value: 'overwrite' },
                { name: 'Cancel', value: false }
            ]
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

// 执行终端命令
async function runCmd(command, args) {
    if (!args) {
        [command, ...args] = command.split(/\s+/)
    }
    return execa(command, args, { cwd: process.cwd() })
}

// clone git address
async function cloneProject(appName) {
    logger(chalk.bgCyanBright(`git clone...\nplease wait...`));
    const gitAdress = 'https://github.com/dongkaifei/react-pro.git';
    return runCmd('git', ['clone', gitAdress, appName]);
}

async function create(appName, options) {
    // 打印目标路径
    const cwd = options.cwd || process.cwd();
    const targetDir = path.resolve(cwd, appName || '.');
    logger(chalk.yellowBright('your dir is: '), chalk.bgMagentaBright(targetDir));

    // 如果存在同名文件夹
    if (fs.existsSync(targetDir)) {
        //目标文件目录已存在，询问是否覆盖
        const action = await isOverwrite();
        if (!action) {
            logger('你选择了取消，请重新命名！');
            return;
        }
        await fs.remove(targetDir)
    }

    // clone...
    const result = await cloneProject(appName);
    if (result.exitCode !== 0) return;
    logger(chalk.bgGreen.white('cloned success!'));

    // 删除.git文件
    if (fs.existsSync(`${targetDir}/.git`)) {
        fs.remove(`${targetDir}/.git`);
    }

    // 修改package项目名称
    await modifyProName(targetDir, appName);

    logger(chalk.bgGreen.white('finish create!'));
}

module.exports = (...arg) => {
    return create(...arg).catch(err => {
        logger(chalk.red('Error: %s'), err.toString());
    })
}