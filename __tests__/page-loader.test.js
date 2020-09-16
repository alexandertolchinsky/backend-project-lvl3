/**
 * @jest-environment node
 */
import nock from 'nock';
import { mkdtemp, readFile } from 'fs/promises';
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
  tmpDir = await mkdtemp(join(tmpdir(), 'page-loader-'));
});

test('pageLoader', async () => {
  const correctAnswer = await readFile(getFixturePath('ru-hexlet-io-courses.html'), 'utf-8');
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, correctAnswer);
  await pageLoader(tmpDir, 'https://ru.hexlet.io/courses');
  const answer = await readFile(`${tmpDir}/ru-hexlet-io-courses.html`, 'utf-8');
  expect(answer).toBe(correctAnswer);
});
