import cheerio from 'cheerio';
import path from 'path';
import axios from 'axios';
import { createWriteStream } from 'fs';
import debug from 'debug';
import 'axios-debug-log';

const log = debug('page-loader:utils');

const convertUrlToName = (url, end = '') => {
  log('launched "convertUrlToName"');
  const { pathname } = url;
  const extname = path.extname(pathname);
  log('extname is "%s', extname);
  if (!extname) {
    const { hostname } = url;
    const name = pathname.length === 1 ? hostname : `${hostname}${pathname}`;
    const result = `${name.replace(/[/\W_]/g, '-')}${end}`;
    log('result is "%s', result);
    log('finished "convertUrlToName');
    return result;
  }
  const dirname = path.dirname(pathname).slice(1);
  log('dirname is "%s', dirname);
  const basename = path.basename(pathname, extname);
  const name = dirname ? `${dirname}/${basename}` : `${basename}`;
  const result = `${name.replace(/[/\W_]/g, '-')}${extname}${end}`;
  log('result is "%s', result);
  log('finished "convertUrlToName');
  return result;
};

const isLocalLink = (link, baseUrlString) => {
  log('launched "isLocalLink');
  const linkUrl = new URL(link, baseUrlString);
  const baseUrl = new URL(baseUrlString);
  log('linkUrl is "%O"', linkUrl);
  log('baseUrl is "%O"', baseUrl);
  const result = linkUrl.hostname === baseUrl.hostname;
  log('result is "%s', result);
  log('finished "isLocalLink');
  return result;
};

const getLocalLinks = (htmlString, urlString, listTags) => {
  log('launched "getLocalLinks');
  const $ = cheerio.load(htmlString);
  const tags = Object.keys(listTags);
  const localLinks = tags
    .reduce((acc, tag) => {
      log('tag is "%s', tag);
      const attribute = listTags[tag];
      log('attribute is "%s', attribute);
      const links = [];
      $(tag).each((i, el) => {
        const attributeValue = $(el).attr(attribute);
        log('attributeValue is "%s', attributeValue);
        links.push({ tag, attribute, attributeValue });
      });
      return [...acc, ...links];
    }, [])
    .filter((link) => link.attributeValue)
    .filter((link) => isLocalLink(link.attributeValue, urlString));
  log('finished "getLocalLinks');
  return localLinks;
};

const getDownloadList = (links, outputDirPath) => {
  log('launched "getDownloadList');
  const result = links
    .map((link) => new URL(link.attributeValue))
    .filter((linkUrl) => linkUrl.pathname !== '/')
    .map((urlLink) => {
      log('urlLink is "%O"', urlLink);
      return new Promise((resolve, reject) => {
        const fileName = convertUrlToName(urlLink);
        const filePath = path.resolve(outputDirPath, fileName);
        axios({
          method: 'get',
          url: urlLink.href,
          responseType: 'stream',
        })
          .then((response) => {
            response.data.pipe(createWriteStream(filePath)
              .on('finish', () => resolve()));
          }).catch(reject);
      });
    });
  log('finished "getLocalLinks');
  return result;
};

const transformLinks = (htmlString, links, handler) => {
  log('launched "transformLinks');
  let result = htmlString;
  // eslint-disable-next-line no-restricted-syntax
  for (const { attribute, attributeValue } of links) {
    result = result.replace(`${attribute}="${attributeValue}"`, `${attribute}="${handler(attributeValue)}"`);
    log('atribute is "%s", attributeValue is "%s"', attribute, attributeValue);
    log('result is "%s"', result);
  }
  log('finished "getLocalLinks');
  return result;
};

export {
  convertUrlToName, getLocalLinks, getDownloadList, transformLinks,
};
