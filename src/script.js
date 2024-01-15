#!/usr/bin/env node

const { exec } = require("child_process");
const checkProxy = () => {
  let proxyCommand;

  // Determine the operating system
  if (process.platform === "win32") {
    proxyCommand = "netsh winhttp show proxy";
  } else if (process.platform === "linux") {
    proxyCommand = "env | grep -i proxy";
  } else if (process.platform === "darwin") {
    proxyCommand = "networksetup -getwebproxy Wi-Fi";
  } else {
    console.error("Unsupported operating system");
    return;
  }

  // Execute the proxy command
  // const result = shell.exec(proxyCommand, { silent: true });
  const result = exec(proxyCommand);
  if (result.code === 0) {
    console.log("Proxy Settings:");
    console.log(result.stdout);
  } else {
    console.error("Error checking proxy settings:");
    console.error(result.stderr);
  }
};

// Call the function to check the proxy
checkProxy();
