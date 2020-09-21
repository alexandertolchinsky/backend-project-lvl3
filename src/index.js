import axios from 'axios';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import {
  convertUrlToName, getLocalLinks, getDownloadList, transformLinks,
} from './utils.js';

const pageLoader = (outputPath, urlString) => (
  new Promise((resolve, reject) => {
    axios(urlString)
      .catch((error) => reject(error))
      .then((response) => {
        const pageUrl = new URL(urlString);
        const pageName = convertUrlToName(pageUrl, '.html');
        const pagePath = path.resolve(outputPath, pageName);
        const pageContent = response.data;
        const listTags = {
          link: 'href',
          script: 'src',
          img: 'src',
        };
        const localLinks = getLocalLinks(pageContent, urlString, listTags);
        if (localLinks.length === 0) {
          writeFile(pagePath, pageContent)
            .catch((error) => reject(error))
            .then(() => resolve());
          return;
        }
        const filesDirName = convertUrlToName(pageUrl, '_files');
        const filesDirPath = path.resolve(outputPath, filesDirName);
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
        mkdir(filesDirPath).then(() => {
          writeFile(pagePath, newPageContent).then(() => {
            Promise.all(downloadList).then(() => resolve());
          });
        });
      });
  })
);

export default pageLoader;
