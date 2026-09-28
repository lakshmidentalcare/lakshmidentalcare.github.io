const fs = require('fs');
const env = fs.readFileSync('backend/.env', 'utf8');
const match = env.match(/GITHUB_TOKEN=["']?([^"'\r\n]+)["']?/);
if (match) {
  const token = match[1];
  const cp = require('child_process');
  try {
    cp.execSync('git pull https://' + token + '@github.com/lakshmidentalcare/lakshmidentalcare.github.io.git main --rebase', {stdio: 'inherit'});
  } catch (e) {
    console.error("Failed to pull", e.message);
  }
  try {
    cp.execSync('git push https://' + token + '@github.com/lakshmidentalcare/lakshmidentalcare.github.io.git main', {stdio: 'inherit'});
    console.log("Push successful");
  } catch (e) {
    console.error("Failed to push", e.message);
  }
} else {
  console.log('token not found');
}
