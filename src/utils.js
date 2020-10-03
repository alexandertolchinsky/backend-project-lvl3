import cheerio from 'cheerio';
import path from 'path';
import debug from 'debug';
import prettier from 'prettier';

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
  if (!link) {
    return false;
  }
  const linkUrl = new URL(link, baseUrlString);
  const baseUrl = new URL(baseUrlString);
  log('linkUrl is %O', linkUrl);
  log('baseUrl is %O', baseUrl);
  return linkUrl.hostname === baseUrl.hostname;
};

const getPageContentAndDownloadLinks = (html, url, filesDirName, filesDirPath) => {
  const downloadLinks = [];
  const $ = cheerio.load(html);
  const tagToAttribute = {
    link: 'href',
    script: 'src',
    img: 'src',
  };
  const tags = Object.keys(tagToAttribute);
  // eslint-disable-next-line no-restricted-syntax
  for (const tag of tags) {
    const attribute = tagToAttribute[tag];
    $(tag).each((i, el) => {
      const link = $(el).attr(attribute);
      log('link is %s', link);
      const linkUrl = new URL(link, url);
      if (isLocalLink(link, url) && linkUrl.pathname !== '/') {
        const fileName = convertUrlToName(linkUrl);
        const filePath = path.resolve(filesDirPath, fileName);
        downloadLinks.push({ link: linkUrl.href, filePath });
        $(el).attr(attribute, `${filesDirName}/${fileName}`);
      }
    });
  }
  const pageContent = prettier.format($.html(), { parser: 'html' });
  return { pageContent, downloadLinks };
};

export {
  convertUrlToName, getPageContentAndDownloadLinks,
};
