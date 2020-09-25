import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import debug from 'debug';
import 'axios-debug-log';
import Listr from 'listr';
import {
  convertUrlToName, getLocalLinks, getDownloadList, transformLinks,
} from './utils.js';

const log = debug('page-loader:index');

const pageLoader = (outputPath, urlString) => {
  log('launched');
  return new Promise((resolve, reject) => {
    const promise = axios(urlString)
      .then((response) => {
        const pageUrl = new URL(urlString);
        const pageName = convertUrlToName(pageUrl, '.html');
        log('pageName is "%s"', pageName);
        const pagePath = path.resolve(outputPath, pageName);
        log('pagePath is "%s"', pagePath);
        const pageContent = response.data;
        log('pageContent is "%s"', pageContent);
        const listTags = {
          link: 'href',
          script: 'src',
          img: 'src',
        };
        const localLinks = getLocalLinks(pageContent, urlString, listTags);
        log('localLinks is "%O"', localLinks);
        if (localLinks.length === 0) {
          fs.writeFile(pagePath, pageContent)
            .catch(reject)
            .then(() => {
              log('page content save successfully');
              log('finished work');
              resolve();
            });
          return;
        }
        const filesDirName = convertUrlToName(pageUrl, '_files');
        log('filesDirName is "%s"', filesDirName);
        const filesDirPath = path.resolve(outputPath, filesDirName);
        log('filesDirPath is "%s"', filesDirPath);
        const localLinksWithHostname = localLinks.map((link) => {
          const attributeValueUrl = new URL(link.attributeValue, urlString);
          const attributeValue = attributeValueUrl.href;
          return { ...link, attributeValue };
        });
        const downloadList = getDownloadList(localLinksWithHostname, filesDirPath);
        const newPageContent = transformLinks(pageContent, localLinks, (value) => {
          const url = new URL(value, urlString);
          return url.pathname === '/' ? '/' : `${filesDirName}/${convertUrlToName(url)}`;
        });
        fs.mkdir(filesDirPath)
          .then(() => {
            log('files directory created successfully');
            fs.writeFile(pagePath, newPageContent)
              .then(() => {
                log('page content save successfully');
                Promise.all(downloadList)
                  .then(() => {
                    log('files save successfully');
                    log('finished work');
                    resolve();
                  }).catch(reject);
              }).catch(reject);
          }).catch(reject);
      }).catch(reject);
    const tasks = new Listr([
      {
        title: `Downloading ${urlString}`,
        task: () => promise,
      },
    ]);
    tasks.run();
  });
};

export default pageLoader;
