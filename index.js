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

    const message = JSON.stringify(github.context.payload.commits[0].message, undefined, 2);
    updateVersionByChanges(getCurrentVersion(), detectChangesByCommitMessage(message));

    console.log('---=== START FROM DIRRECT REPO ===---');
  } catch (error) {
    core.setFailed(error.message);
  }
}

function detectChangesByCommitMessage(message) {
  let result = NONE;
  if (message.indexOf(MAJOR) === 1) {
    result = MAJOR;
  } if (message.indexOf(MINOR) === 1) {
    result = MINOR;
  } if (message.indexOf(PATCH) === 1) {
    result = PATCH;
  }
  return result;
}

function getCurrentVersion() {
  const packageJsonRawdata = fs.readFileSync('package.json');
  const packageJsonData = JSON.parse(packageJsonRawdata);
  return packageJsonData.version;
}

function updateVersionByChanges(version, changes) {
  new Map([
    [NONE, (version) => {
      console.log('No changes detected.');
    }],
    [PATCH, (version) => {
      console.log('Path changes detected.');
    }],
    [MINOR, (version) => {
      console.log('Minor changes detected.');
    }],
    [MAJOR, (version) => {
      console.log('Major changes detected.');
    }],
  ]).get(changes)(version);
}
