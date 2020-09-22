/**
 * @jest-environment node
 */
import nock from 'nock';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import pageLoader from '../src/index.js';

nock.disableNetConnect();

/* eslint-disable no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturePath = (filename) => join(__dirname, '..', '__fixtures__', filename);

let tmpDir;
beforeEach(async () => {
  tmpDir = await fs.mkdtemp(join(tmpdir(), 'page-loader-'));
});

test('pageLoader downloads https://example.com without local links', async () => {
  const correctAnswer = await fs.readFile(getFixturePath('page-without-links.html'), 'utf-8');
  nock('https://example.com').get('/').reply(200, correctAnswer);
  await pageLoader(tmpDir, 'https://example.com');
  const downloadedPagePath = `${tmpDir}/example-com.html`;
  const downloadedPageContent = await fs.readFile(downloadedPagePath, 'utf-8');
  expect(downloadedPageContent).toBe(correctAnswer);
});

test('pageLoader downloads https://example.com/ without local links', async () => {
  const correctAnswer = await fs.readFile(getFixturePath('page-without-links.html'), 'utf-8');
  nock('https://example.com').get('/').reply(200, correctAnswer);
  await pageLoader(tmpDir, 'https://example.com/');
  const downloadedPagePath = `${tmpDir}/example-com.html`;
  const downloadedPageContent = await fs.readFile(downloadedPagePath, 'utf-8');
  expect(downloadedPageContent).toBe(correctAnswer);
});

test('pageLoader downloads https://example.com/courses with local links', async () => {
  const pageWithLinksContent = await fs.readFile(getFixturePath('page-with-links.html'), 'utf-8');
  const pageWithLocalLinksContent = await fs.readFile(getFixturePath('page-with-local-links.html'), 'utf-8');
  const correctScriptContent = await fs.readFile(getFixturePath('script.js'), 'utf-8');
  const correctStyleContent = await fs.readFile(getFixturePath('style.css'), 'utf-8');
  const correctImageBuffer = await fs.readFile(getFixturePath('image.png'));
  nock('https://example.com').get('/courses').reply(200, pageWithLinksContent);
  nock('https://example.com').get('/scripts/script.js').reply(200, correctScriptContent);
  nock('https://example.com').get('/style.css').reply(200, correctStyleContent);
  nock('https://example.com').get('/image.png').reply(200, correctImageBuffer);
  await pageLoader(tmpDir, 'https://example.com/courses');
  const downloadedPagePath = `${tmpDir}/example-com-courses.html`;
  const downloadedPageContent = await fs.readFile(downloadedPagePath, 'utf-8');
  expect(downloadedPageContent).toBe(pageWithLocalLinksContent);
  const scriptPath = `${tmpDir}/example-com-courses_files/scripts-script.js`;
  const scriptContent = await fs.readFile(scriptPath, 'utf-8');
  expect(scriptContent).toBe(correctScriptContent);
  const stylePath = `${tmpDir}/example-com-courses_files/style.css`;
  const styleContent = await fs.readFile(stylePath, 'utf-8');
  expect(styleContent).toBe(correctStyleContent);
  const imagePath = `${tmpDir}/example-com-courses_files/image.png`;
  const imageBuffer = await fs.readFile(imagePath);
  expect(imageBuffer.compare(correctImageBuffer)).toBe(0);
});

test('pageLoader trying to download a non-existent page', async () => {
  nock('https://example.com').get('/404').reply(404, '');
  await expect(pageLoader(tmpDir, 'https://example.com/404')).rejects.toThrow('Request failed with status code 404');
});

test('pageLoader trying to download to a non-existent directory', async () => {
  nock('https://example.com').get('/').reply(200, '');
  await expect(pageLoader(`${tmpDir}/non-existent-directory`, 'https://example.com/')).rejects.toThrow('no such file or directory');
});
