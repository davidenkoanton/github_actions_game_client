const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const simpleGit = require('simple-git');

const MAJOR = 'feat!';
const MINOR = 'feat';
const PATCH = 'fix';
const NONE = 'none';

main();

function main() {
  try {
    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);

    const message = JSON.stringify(github.context.payload.commits[0].message, undefined, 2);
    const packageJsonData = getPackageJsonData();
    const newVersion = getNewVersionByChanges(packageJsonData.version, detectChangesByCommitMessage(message));
    console.log(`Current version: ${packageJsonData.version}, new version: ${newVersion}, need update: ${newVersion !== packageJsonData.version}`);
    if (newVersion !== packageJsonData.version) {
      packageJsonData.version = newVersion;
      fs.writeFileSync('package.json', JSON.stringify(packageJsonData));

      const ref = JSON.stringify(github.context.payload.ref, undefined, 2);
      const branch = ref.split('/')[2].split('"')[0];
      // const git_url = JSON.stringify(github.context.payload.repository.git_url, undefined, 2);
      addToRepository(branch);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

function detectChangesByCommitMessage(message) {
  let result = NONE;
  if (message.indexOf(MAJOR) === 1) {
    result = MAJOR;
  } else if (message.indexOf(MINOR) === 1) {
    result = MINOR;
  } else if (message.indexOf(PATCH) === 1) {
    result = PATCH;
  }
  return result;
}

function getPackageJsonData() {
  const packageJsonRawdata = fs.readFileSync('package.json');
  return JSON.parse(packageJsonRawdata);
}

function getNewVersionByChanges(version, changes) {
  const versionArray = version.split('.');
  new Map([
    [NONE, () => {
      console.log('Changes clasify is not detected. No version update.');
    }],
    [PATCH, () => {
      versionArray[2]++;
      console.log('Path changes detected.');
    }],
    [MINOR, () => {
      versionArray[1]++;
      versionArray[2] = 0;
      console.log('Minor changes detected.');
    }],
    [MAJOR, () => {
      versionArray[0]++;
      versionArray[1] = 0;
      versionArray[2] = 0;
      console.log('Major changes detected.');
    }],
  ]).get(changes)();
  const newVersion = `${versionArray[0]}.${versionArray[1]}.${versionArray[2]}`;
  return newVersion;
}

function addToRepository(branch) {
  console.log('start addToRepository');
  simpleGit('./', { binary: 'git' })
    .add('package.json', () => console.log('git add'))
    .commit('[github actions]: update vsersion', () => console.log('git commit'))
    .branch([branch])
    .push(['-u', 'origin', branch], () => console.log(`git push ${branch}`));
  console.log('end addToRepository');
}
