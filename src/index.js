import axios from 'axios';
import path from 'path';
import { promises as fs, createWriteStream } from 'fs';
import 'axios-debug-log';
import {
  convertUrlToName, getPageContentAndDownloadLinks,
} from './utils.js';

const loadPage = (outputPath, url) => (
  axios(url)
    .then((response) => {
      const pageUrl = new URL(url);
      const pageName = convertUrlToName(pageUrl, '.html');
      const pagePath = path.resolve(outputPath, pageName);
      const filesDirName = convertUrlToName(pageUrl, '_files');
      const filesDirPath = path.resolve(outputPath, filesDirName);
      const {
        pageContent,
        downloadLinks,
      } = getPageContentAndDownloadLinks(response.data, url, filesDirName, filesDirPath);
      if (downloadLinks.length === 0) {
        return fs.writeFile(pagePath, pageContent).then(() => pageName);
      }
      return fs.writeFile(pagePath, pageContent)
        .then(() => (
          fs.mkdir(filesDirPath)
            .then(() => {
              const promises = downloadLinks
                .map(({ link, filePath }) => (
                  axios({
                    method: 'get',
                    url: link,
                    responseType: 'stream',
                  }).then(({ data }) => {
                    const stream = data.pipe(createWriteStream(filePath));
                    return new Promise((resolve, reject) => {
                      stream.on('finish', () => resolve());
                      stream.on('error', () => reject);
                    });
                  })
                ));
              return Promise.all(promises);
            })
        ))
        .then(() => pageName);
    })
);

export default loadPage;
