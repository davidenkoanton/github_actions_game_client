const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const MAJOR = 'feat!';
const MINOR = 'feat';
const PATCH = 'fix';
const NONE = 'none';

main();

function main() {
  try {
    // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput('who-to-greet');
    // console.log(`Hello ${nameToGreet}!`);
    // const time = (new Date()).toTimeString();
    // core.setOutput("time", time);

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);

    const message = JSON.stringify(github.context.payload.commits[0].message, undefined, 2);
    const packageJsonData = getPackageJsonData();
    console.log(`Current version: ${packageJsonData.version}`);
    const newVersion = getNewVersionByChanges(packageJsonData.version, detectChangesByCommitMessage(message));
    console.log(`New version: ${newVersion}`);
    packageJsonData.version = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(packageJsonData));

    console.log('Test file updated.');
    console.log(getPackageJsonData());

    // const ref = JSON.stringify(github.context.payload.ref, undefined, 2);
    // const branch = ref.split('/')[2].split('"')[0];
    // addToRepository(branch, );
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

function addToRepository(branch, repositoryUrl) {
  simpleGit(directoryName, { binary: 'git' })
    .init(() => console.log('git init'))
    .add('./*', () => console.log('git add'))
    .commit('first commit!', () => console.log('git commit'))
    .addRemote('origin', repositoryUrl, () => console.log('git addRemote'))
    .branch(['dgm-dev'])
    .push(['-u', 'origin', branch], () => console.log(`git push ${branch}`));
}
