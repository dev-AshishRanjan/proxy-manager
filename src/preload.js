const { exec } = require("child_process");
const { contextBridge, ipcRenderer } = require("electron");
const Toastify = require("toastify-js");
const { shell } = require("electron");
// predefined proxy
process.platform = "linux";
const predefinedProxy = [
  {
    id: 1,
    title: "Labs",
    ipAddress: "172.16.199.20",
    port: 8080,
  },
  {
    id: 2,
    title: "BH9",
    ipAddress: "172.16.2.11",
    port: 3128,
  },
  {
    id: 3,
    title: "BH8",
    ipAddress: "172.16.199.40",
    port: 8080,
  },
];

// getting proxy from localstorage
var proxyList;
var proxyListParsed;
function checkProxyList() {
  proxyList = localStorage.getItem("proxyList");
  proxyListParsed = JSON.parse(proxyList);
  console.log({ proxyList });
  if (proxyList === null) {
    localStorage.setItem("proxyList", JSON.stringify(predefinedProxy));
    proxyList = JSON.stringify(predefinedProxy);
    proxyListParsed = predefinedProxy;
  }
  return proxyListParsed;
}
// checkProxyList();
// console.log({ proxyList });
// if (proxyList === null || proxyList == "[]") {
//   localStorage.setItem("proxyList", JSON.stringify(predefinedProxy));
//   proxyList = JSON.stringify(predefinedProxy);
//   proxyListParsed = predefinedProxy;
// }

function proxyListAdd(data) {
  const timeId = new Date().getTime().toString();
  const newData = {
    id: timeId,
    title: data.title || timeId.slice(0, 4),
    ipAddress: data.ipAddress || "127.0.0.1",
    port: parseInt(data.port || "80"),
  };
  console.log({ newData });
  let originalData = checkProxyList();
  if (!originalData.find((e) => e.id === timeId)) {
    // add to list and save in local storage
    originalData.push(newData);
    localStorage.setItem("proxyList", JSON.stringify(originalData));
    // ipcRenderer.send("custom-form:accepted", {
    //   msg: `Proxy data added`,
    // });
  } else {
    alert(`${newData.title} already exists.`);
  }
}

function proxyListDelete(data) {
  let proxies = checkProxyList();
  console.log({ proxies });
  console.log({ data });
  let index = proxies.findIndex((p) => p.id === data);
  console.log({ index });
  if (index !== -1) {
    proxies.splice(index, 1);
    localStorage.setItem("proxyList", JSON.stringify(proxies));
  } else {
    alert("No such item found");
  }
}

function proxyListUpdate(data) {
  let proxies = checkProxyList();
  let target = proxies.find((p) => p.id === data.id);
  if (!target) return false;
  updatedProxies = proxies.map((ele) => {
    if (ele.id === data.id) {
      return data;
    } else return ele;
  });
  // console.log({ updatedProxies });
  localStorage.setItem("proxyList", JSON.stringify(updatedProxies));
  return true;
}

// console.log({ proxyList });

const executeLinuxCommands = (commands) => {
  return new Promise((resolve, reject) => {
    exec(commands.join(" && "), (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
};

// checking current proxy of system
// sending data to renderer process
const checkCurrentProxy = async (callback) => {
  let proxyCommand;

  // Determine the operating system
  if (process.platform === "win32") {
    proxyCommand =
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" | find "ProxyServer"';
  } else if (process.platform === "linux") {
    proxyCommand = [
      `gsettings get org.gnome.system.proxy mode`,
      `gsettings get org.gnome.system.proxy.http host`,
      `gsettings get org.gnome.system.proxy.http port`,
    ];
    const { stdout, stderr } = await executeLinuxCommands(proxyCommand);
    const [mode, host, port] = stdout
      .trim()
      .split("\n")
      .map((line) => line.trim());

    if (host === "''" || isNaN(port) || mode.includes("none")) {
      // Proxy is not set or invalid
      console.log("Proxy is not set on Gnome");
      callback(undefined, null);
    } else {
      console.log("Proxy Settings:");
      console.log("Host:", host);
      const ipAddress = host.replace(/'/g, "");
      console.log("Port:", port);
      callback(`${ipAddress}:${port}`, null);
    }
  } else if (process.platform === "darwin") {
    proxyCommand = "networksetup -getwebproxy Wi-Fi";
  } else {
    console.error("Unsupported operating system");
    callback(null, "Unsupported operating system");
    return;
  }

  // Execute the proxy command
  if (process.platform !== "linux") {
    exec(proxyCommand, (error, stdout, stderr) => {
      if (error) {
        console.log({ error });
        console.error("Error checking proxy settings:", stderr);
        callback(null, `Error checking proxy settings: ${stderr}`);
        return;
      }

      // Check the result and print the proxy settings
      console.log("Proxy Settings:");
      console.log({ stdout });
      localStorage.setItem("stdout", stdout);
      // var currentProxy;

      const proxy = stdout.split(" ");
      console.log({ proxy });
      const currentProxy = proxy[proxy.length - 1].trim();
      console.log({ currentProxy });
      callback(currentProxy, null);
    });
  }
};
// checkCurrentProxy();

// exposing to renderer process
// here mainly nodejs library methods are exposed
contextBridge.exposeInMainWorld("proxy", {
  checkCurrentProxy: (e) => checkCurrentProxy(e),
  checkProxyList: () => checkProxyList(),
  proxyListAdd: (e) => proxyListAdd(e),
  proxyListDelete: (e) => proxyListDelete(e),
  proxyListUpdate: (e) => proxyListUpdate(e),
});

contextBridge.exposeInMainWorld("Toastify", {
  toast: (options) => Toastify(options).showToast(),
});
contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld("Links", {
  openLink: (link) => shell.openExternal(link),
});
