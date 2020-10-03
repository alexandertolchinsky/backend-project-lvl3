import axios from 'axios';
import path from 'path';
import { promises as fs, createWriteStream } from 'fs';
import 'axios-debug-log';
import debug from 'debug';
import Listr from 'listr';
import {
  convertUrlToName, getPageContentAndDownloadLinks,
} from './utils.js';

const log = debug('page-loader:index');

const loadPage = (outputPath, url) => (
  axios(url)
    .then((response) => {
      const pageUrl = new URL(url);
      const pageName = convertUrlToName(pageUrl, '.html');
      log('pageName is %s', pageName);
      const pagePath = path.resolve(outputPath, pageName);
      log('pagePath is %s', pagePath);
      const filesDirName = convertUrlToName(pageUrl, '_files');
      const filesDirPath = path.resolve(outputPath, filesDirName);
      log('filesDirPath is %s', filesDirPath);
      const {
        pageContent,
        downloadLinks,
      } = getPageContentAndDownloadLinks(response.data, url, filesDirName, filesDirPath);
      log('downloadLinks is %O', downloadLinks);
      if (downloadLinks.length === 0) {
        return fs.writeFile(pagePath, pageContent).then(() => pageName);
      }
      return fs.writeFile(pagePath, pageContent)
        .then(() => (
          fs.mkdir(filesDirPath)
            .then(() => {
              const promises = downloadLinks
                .map(({ link, filePath }) => {
                  const promise = axios({
                    method: 'get',
                    url: link,
                    responseType: 'stream',
                  }).then(({ data }) => {
                    const stream = data.pipe(createWriteStream(filePath));
                    return new Promise((resolve, reject) => {
                      stream.on('finish', () => resolve());
                      stream.on('error', () => reject);
                    });
                  });
                  return { promise, link };
                });
              const tasks = promises.map(({ promise, link }) => {
                const task = {
                  title: link,
                  task: () => promise,
                };
                return task;
              });
              return new Listr(tasks, { concurrent: true }).run();
            })
        ))
        .then(() => pageName);
    })
);

export default loadPage;
