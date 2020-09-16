import axios from 'axios';
import { promises as fs } from 'fs';
import { resolve } from 'path';

const convertUrlToFileName = (url) => {
  const fileName = url.slice(url.indexOf('/') + 2).replace(/[\W_]/g, '-');
  const fileExtension = '.html';
  return `${fileName}${fileExtension}`;
};

const pageLoader = (outputPath, url) => {
  return new Promise((res) => {
    const fileName = convertUrlToFileName(url);
    const filePath = resolve(outputPath, fileName);
    axios.get(url)
      .then((response) => {
        fs.writeFile(filePath, response.data, 'utf-8').then(() => res());
      });
  });
};

export default pageLoader;
