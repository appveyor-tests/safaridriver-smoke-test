const childProcess = require("child_process");
const ps = require("ps-node");
const util = require("util");
const wd = require("wd");

const psLookupAsync = util.promisify(ps.lookup);

const executeTest = async function () {
  let servicePid = null;
  try {
    // start safaridriver
    await childProcess.execFile('/usr/bin/safaridriver', ['--port', 4723]);
    for (let i = 0; i < 10; i++) {
      serviceProcesses = await psLookupAsync({ command: 'com.apple.WebDriver.HTTPService', psargs: 'x' });
      if (serviceProcesses.length > 0) {
        found = true;
        break;
      }
      await new Promise(r => setTimeout(r, 1000));;
    }
    if (!found) {
      throw new Error("Failed to start safaridriver for some reason");
    }
    servicePid = serviceProcesses[0].pid;
    console.log("Safaridriver launched");

    // Manipulate Safari
    let driver = null;
    try {
      driver = wd.promiseChainRemote('http://localhost:4723');
      await driver.init({ 'allowW3C': true, 'browserName': 'safari' });
      await driver.get('https://google.com');
      console.log("Safari worked");
    } catch (e) {
      console.log(e);
    } finally {
      if (driver != null) {
        try {
          await driver.quit();
        } catch (e) {
          // ignore
        }
      }
    }
  } catch(e) {
    console.log(e);
  } finally {
    if (servicePid != null) {
      // quit safaridriver
      childProcess.execSync(util.format('kill -9 %d', servicePid));
    }
  }
};

setTimeout(executeTest);

