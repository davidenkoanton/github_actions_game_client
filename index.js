const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
  console.log(`payload.commits: ${payload.commits}`);
  console.log(`payload.commits[0]: ${payload.commits[0]}`);
  console.log(`payload.commits[0].message: ${payload.commits[0].message}`);
  console.log('---=== START FROM DIRRECT REPO ===---');
} catch (error) {
  core.setFailed(error.message);
}