const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const logger = console.log;
const {
    // runCmd,
    toInquirer,
    modifyProName,
    cloneProject,
    generateReadme
} = require('./utils');

async function create(appName, options) {
    // 打印目标路径
    const cwd = options.cwd || process.cwd();
    const targetDir = path.resolve(cwd, appName || '.');
    logger(chalk.yellowBright('🌰 your dir is: '), chalk.bgMagentaBright(targetDir));

    // 如果存在同名文件夹
    if (fs.existsSync(targetDir)) {
        //目标文件目录已存在，询问是否覆盖
        const action = await toInquirer({
            message: `Target directory already exists. Pick an action:`,
            choices: [
                { name: 'Overwrite', value: 'overwrite' },
                { name: 'Cancel', value: false }
            ]
        });
        if (!action) {
            logger('你选择了取消，请重新命名！');
            return;
        }
        await fs.remove(targetDir)
    }

    // clone...
    const cloneResult = await cloneProject(appName);
    if (!cloneResult) return;

    // 删除.git文件及README.md
    if (fs.existsSync(`${targetDir}/.git`)) {
        fs.removeSync(`${targetDir}/.git`);
    }
    if (fs.existsSync(`${targetDir}/README.md`)) {
        fs.removeSync(`${targetDir}/README.md`);
    }
    // 创建新的README.md
    await generateReadme(appName, 'npm', targetDir);

    // 修改package项目名称
    await modifyProName(targetDir, appName);

    logger(chalk.bgGreen.white('finish create!'));

    // 询问是否立即开始安装依赖及开始运行
    // const isInstall = await toInquirer({
    //     message: `是否立即开始项目:`,
    //     choices: [
    //         { name: 'Go', value: 'yes' },
    //         { name: 'Cancel', value: 'cancel' }
    //     ]
    // });
    // if (isInstall === 'cancel') {
    //     logger('项目创建已完成！');
    //     return;
    // }

    // cd当前项目目录并执行install
    // console.log(await runCmd('cd', [targetDir]));
}

module.exports = (...arg) => {
    return create(...arg).catch(err => {
        logger(chalk.red('Error: %s'), err.toString());
    })
}