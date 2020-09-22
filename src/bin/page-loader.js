#!/usr/bin/env node
import commander from 'commander';
import pageLoader from '../index.js';

const program = new commander.Command();
program.version('1.0.0');
program.description('Downloading the address from the network');
program.option('--output [path]', 'path to output directory', process.cwd());
program.arguments('<url>');
program.action((url) => {
  pageLoader(program.output, url).catch((error) => {
    console.error(error);
    process.exit(1);
  });
});
program.parse(process.argv);
