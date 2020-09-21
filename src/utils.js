import cheerio from 'cheerio';
import path from 'path';
import axios from 'axios';
import { createWriteStream } from 'fs';

const convertUrlToName = (url, end = '') => {
  const { pathname } = url;
  const extname = path.extname(pathname);
  if (!extname) {
    const { hostname } = url;
    const name = pathname.length === 1 ? hostname : `${hostname}${pathname}`;
    return `${name.replace(/[/\W_]/g, '-')}${end}`;
  }
  const dirname = path.dirname(pathname).slice(1);
  const basename = path.basename(pathname, extname);
  const name = dirname ? `${dirname}/${basename}` : `${basename}`;
  return `${name.replace(/[/\W_]/g, '-')}${extname}${end}`;
};

const isLocalLink = (link, baseUrlString) => {
  const linkUrl = new URL(link, baseUrlString);
  const baseUrl = new URL(baseUrlString);
  return linkUrl.hostname === baseUrl.hostname;
};

const getLocalLinks = (htmlString, urlString, listTags) => {
  const $ = cheerio.load(htmlString);
  const tags = Object.keys(listTags);
  const localLinks = tags
    .reduce((acc, tag) => {
      const attribute = listTags[tag];
      const links = [];
      $(tag).each((i, el) => {
        const attributeValue = $(el).attr(attribute);
        links.push({ tag, attribute, attributeValue });
      });
      return [...acc, ...links];
    }, [])
    .filter((link) => link.attributeValue)
    .filter((link) => isLocalLink(link.attributeValue, urlString));
  return localLinks;
};

const getDownloadList = (links, outputDirPath) => (
  links
    .map((link) => new URL(link.attributeValue))
    .filter((linkUrl) => linkUrl.pathname !== '/')
    .map((urlLink) => (
      new Promise((resolve) => {
        const fileName = convertUrlToName(urlLink);
        const filePath = path.resolve(outputDirPath, fileName);
        axios({
          method: 'get',
          url: urlLink.href,
          responseType: 'stream',
        }).then((response) => {
          response.data.pipe(createWriteStream(filePath));
          resolve();
        });
      })
    ))
);

const transformLinks = (htmlString, links, handler) => {
  let result = htmlString;
  // eslint-disable-next-line no-restricted-syntax
  for (const { attribute, attributeValue } of links) {
    result = result.replace(`${attribute}="${attributeValue}"`, `${attribute}="${handler(attributeValue)}"`);
  }
  return result;
};

export {
  convertUrlToName, getLocalLinks, getDownloadList, transformLinks,
};
