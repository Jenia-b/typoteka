'use strict';
const chalk = require(`chalk`);
const {nanoid} = require(`nanoid`);

const {
  getRandomInt,
  getRandomDate,
  readFile,
  writeFile,
  randomlySwapAllElements} = require(`../../utils`);

const {MOCKS_FILE_NAME,} = require(`../../constants`);
const FILE_ANNOUNCE_PATH = `./data/announce.txt`;
const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;

const DEFAULT_COUNT_OF_PUBLICATIONS = 1;
const MAX_COUNT_OF_PUBLICATIONS = 1000;
const MAX_ID_LENGTH = 6;
const MAX_COMMENTS = 4;

module.exports = {
  name: `--generate`,
  async run(params) {
    const count = validationParams(params);
    const publications = await generatePublications(count);
    const output = formatOutput(publications);
    await writeFile(MOCKS_FILE_NAME, output);
  }
};

async function generatePublications(count) {
  const publications = [];
  const titleList = parseData(await readFile(FILE_TITLES_PATH));
  const announceList = parseData(await readFile(FILE_ANNOUNCE_PATH));
  const categoryList = parseData(await readFile(FILE_CATEGORIES_PATH));
  const commentList = parseData(await readFile(FILE_COMMENTS_PATH));

  for (let i = 0; i < count; i++) {
    const title = titleList[getRandomInt(0, titleList.length - 1)];
    const announce = announceList[getRandomInt(0, announceList.length - 1)];
    const category = categoryList[getRandomInt(0, categoryList.length - 1)];
    const comment = generateComments(getRandomInt(1, MAX_COMMENTS), commentList);

    publications.push({
      id: nanoid(MAX_ID_LENGTH),
      title: title,
      announce: announce,
      fullText: title + ` ` + announce,
      createdDate: getRandomDate(),
      category: category,
      comment: comment,
    });
  }

  return publications;
}

function generateComments(count, comments) {
  return (
    Array(count).fill({}).map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      text: randomlySwapAllElements(comments)
        .slice(0, getRandomInt(1, 3))
        .join(` `),
    })));
}

function validationParams(param) {
  const count = Number(param[0]) || DEFAULT_COUNT_OF_PUBLICATIONS;
  if (count > MAX_COUNT_OF_PUBLICATIONS) {
    throw new Error(chalk.red(`Не больше ${MAX_COUNT_OF_PUBLICATIONS} объявлений`));
  }
  return count;
}

function parseData(source) {
  return source
    .split(`\n`)
    .map(line => line.trim())
    .filter(line => line.length !== 0);
}

function formatOutput(publications) {
  return JSON.stringify(publications, null, 4);
}
