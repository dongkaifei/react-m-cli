#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const create = require('../libs/create');
const logger = console.log;

// 读取当前版本号
program.version(require('../package').version, '-v, --version');

// 定义帮助内容
program.on('--help', () => {
    logger('no help can use')
});

// 定义创建命令
program
    .command('create <app-name>')
    .description('create a react project for mobile')
    .action((appName, options) => {
        logger(chalk.green('your app name is:'), chalk.bgYellowBright(appName));
        // 开始创建
        create(appName, options);
    })

// parse终端命令
program.parse(process.argv);