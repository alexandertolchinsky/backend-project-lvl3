#!/usr/bin/env node
import commander from 'commander';
import loadPage from '../index.js';

const program = new commander.Command();
program.version('1.0.0');
program.description('Downloading the address from the network');
program.option('--output [path]', 'path to output directory', process.cwd());
program.arguments('<url>');
program.action((url) => {
  loadPage(program.output, url)
    .then((pageName) => {
      console.log(`Page was downloaded as '${pageName}'`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
});
program.parse(process.argv);
