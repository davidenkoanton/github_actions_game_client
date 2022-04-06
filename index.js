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
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);

    const ref = JSON.stringify(github.context.payload.ref, undefined, 2);
    console.log(`Current ref: ${ref}`);

    const message = JSON.stringify(github.context.payload.commits[0].message, undefined, 2);
    console.log(`Current version: ${getCurrentVersion()}`);
    const newVersion = getNewVersionByChanges(getCurrentVersion(), detectChangesByCommitMessage(message));
    console.log(`New version: ${newVersion}`);
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

function getCurrentVersion() {
  const packageJsonRawdata = fs.readFileSync('package.json');
  const packageJsonData = JSON.parse(packageJsonRawdata);
  return packageJsonData.version;
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
