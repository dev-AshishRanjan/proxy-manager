const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  Notification,
  webContents,
} = require("electron");
const path = require("path");
const { exec } = require("child_process");
var sudo = require("sudo-prompt");
// const settings = require("electron-settings");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const isMac = process.platform === "darwin";
const isLinux = process.platform === "linux";
const isDev = process.env.NODE_ENV === "development"; //change it to (!=="production")

let mainWindow;
let dynamicWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: isDev ? 1000 : 550,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
    // autoHideMenuBar: true,
    icon: path.join(__dirname, "./assets/icons/icon_512.png"),
    roundedCorners: true,
  });
  mainWindow.setIcon(path.join(__dirname, "./assets/icons/icon_512.png"));
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "./app/index.html"));
  // Open the DevTools if dev
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  // when main window is closed, close all window
  mainWindow.on("closed", () => {
    // Close all windows when the main window is closed
    // showNotification(
    //   "Final Proxy",
    //   "👋🏻😊👋🏻"
    // );
    if (dynamicWindow) {
      dynamicWindow = null;
    }
    if (!isMac) {
      app.quit();
    }
  });
};
// create dynamic window
const createDynamicWindow = (file) => {
  dynamicWindow = new BrowserWindow({
    width: isDev ? 1000 : 550,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
    fullscreenable: false,
    resizable: false,
    icon: path.join(__dirname, "./assets/icons/icon_512.png"),
    roundedCorners: true,
    autoHideMenuBar: true,
  });

  dynamicWindow.setIcon(path.join(__dirname, "./assets/icons/icon_512.png"));
  // and load the index.html of the app.
  dynamicWindow.loadFile(path.join(__dirname, `./app/${file}`));
  if (isDev) {
    dynamicWindow.webContents.openDevTools();
  }
};

const createURLWindow = (file) => {
  dynamicWindow = new BrowserWindow({
    width: isDev ? 1000 : 550,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
    fullscreenable: false,
    autoHideMenuBar: true,
    resizable: false,
    icon: path.join(__dirname, "./assets/icons/icon_512.png"),
    roundedCorners: true,
  });

  dynamicWindow.setIcon(path.join(__dirname, "./assets/icons/icon_512.png"));
  // and load the index.html of the app.
  dynamicWindow.loadURL("https://aethernex.vercel.app");
  if (isDev) {
    dynamicWindow.webContents.openDevTools();
  }
};

function showNotification({ title, body }) {
  new Notification({
    title: title,
    body: body,
  }).show();
}

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: () => createDynamicWindow("about.html"),
              accelerator: "CmdOrCtrl+B",
            },
            {
              label: "Notice",
              click: () => createDynamicWindow("notice.html"),
              accelerator: "CmdOrCtrl+N",
            },
            {
              label: "Contact Us",
              click: () => createDynamicWindow("contact.html"),
              accelerator: "CmdOrCtrl+M",
            },
            {
              type: "separator",
            },
            {
              label: "Check System Proxy",
              click: () => createDynamicWindow("checkProxy.html"),
              accelerator: "CmdOrCtrl+S",
            },
            {
              label: "Add Custom Proxy",
              click: () => createDynamicWindow("custom.html"),
              accelerator: "CmdOrCtrl+P",
            },
            {
              type: "separator",
            },
            {
              label: "Check Internet Speed",
              click: () => createURLWindow(),
              accelerator: "CmdOrCtrl+I",
            },
            {
              label: "Open Dev Tools",
              click: () => mainWindow.webContents.openDevTools(),
              accelerator: "CmdOrCtrl+D",
              visible: false,
            },
          ],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "CmdOrCtrl+w",
      },
    ],
  },
  ...(!isMac
    ? [
        {
          label: "Options",
          submenu: [
            {
              label: "About",
              click: () => createDynamicWindow("about.html"),
              accelerator: "CmdOrCtrl+B",
            },
            {
              label: "Notice",
              click: () => createDynamicWindow("notice.html"),
              accelerator: "CmdOrCtrl+N",
            },
            {
              label: "Contact Us",
              click: () => createDynamicWindow("contact.html"),
              accelerator: "CmdOrCtrl+M",
            },
            {
              type: "separator",
            },
            {
              label: "Check System Proxy",
              click: () => createDynamicWindow("checkProxy.html"),
              accelerator: "CmdOrCtrl+S",
            },
            {
              label: "Add Custom Proxy",
              click: () => createDynamicWindow("custom.html"),
              accelerator: "CmdOrCtrl+P",
            },
            {
              type: "separator",
            },
            {
              label: "Check Internet Speed",
              click: () => createURLWindow(),
              accelerator: "CmdOrCtrl+I",
            },
            {
              label: "Open Dev Tools",
              click: () => mainWindow.webContents.openDevTools(),
              accelerator: "CmdOrCtrl+D",
              visible: false,
            },
          ],
        },
      ]
    : []),
  ...(isLinux
    ? [
        {
          label: "More",
          submenu: [
            {
              label: "Sudo Usage",
              click: () => createDynamicWindow("addSudo.html"),
              accelerator: "CmdOrCtrl+U",
            },
          ],
        },
      ]
    : []),
  ...(isMac
    ? [
        {
          label: "More",
          submenu: [
            {
              label: "All Networks",
              click: () => createDynamicWindow("macAllNetwork.html"),
              accelerator: "CmdOrCtrl+U",
            },
          ],
        },
      ]
    : []),
];

// checking proxy
const checkProxy = () => {
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
    exec(proxyCommand.join(" && "), (error, stdout, stderr) => {
      if (error) {
        console.error("Error checking Gnome proxy settings:", stderr);
        mainWindow.webContents.send("proxy:check:error", {
          msg: `error : ${stderr}`,
        });
        dynamicWindow.webContents.send("proxy:check:error", {
          msg: `error : ${stderr}`,
        });
      }

      const [mode, host, port] = stdout
        .trim()
        .split("\n")
        .map((line) => line.trim());
      var linuxProxy;
      if (host === "''" || isNaN(port) || mode.includes("none")) {
        // Proxy is not set or invalid
        console.log("Proxy is not set on Gnome");
        linuxProxy = undefined;
      } else {
        console.log("Proxy Settings:");
        console.log("Host:", host);
        const ipAddress = host.replace(/'/g, "");
        console.log("Port:", port);
        linuxProxy = `${ipAddress}:${port}`;
      }
      mainWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${linuxProxy}`,
        proxy: linuxProxy,
      });
      dynamicWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${linuxProxy}`,
        proxy: linuxProxy,
      });
    });
  } else if (process.platform === "darwin") {
    proxyCommand = "networksetup -getwebproxy Wi-Fi";
    exec(proxyCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("Error checking darwin wifi proxy settings:", stderr);
        mainWindow.webContents.send("proxy:check:error", {
          msg: `error : ${stderr}`,
        });
        dynamicWindow.webContents.send("proxy:check:error", {
          msg: `error : ${stderr}`,
        });
      }

      const [Enabled, Server, Port, Authenticated_Proxy_Enabled] = stdout
        .trim()
        .split("\n")
        .map((line) => line.trim().split(":")[1].trim());
      var linuxProxy;
      if (
        Server === "''" ||
        isNaN(Port) ||
        Enabled.includes("No") ||
        Enabled.toLowerCase().includes("no") ||
        Port == 0
      ) {
        // Proxy is not set or invalid
        console.log("Proxy is not set on mac");
        linuxProxy = undefined;
      } else {
        console.log("Proxy Settings:");
        console.log("Host:", Server);
        const ipAddress = Server.replace(/'/g, "");
        console.log("Port:", Port);
        linuxProxy = `${Server}:${Port}`;
      }
      mainWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${linuxProxy}`,
        proxy: linuxProxy,
      });
      dynamicWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${linuxProxy}`,
        proxy: linuxProxy,
      });
    });
  } else {
    console.error("Unsupported operating system");
    mainWindow.webContents.send("proxy:check:error", {
      msg: `error : Unsupported operating system`,
    });
    dynamicWindow.webContents.send("proxy:check:error", {
      msg: `error : Unsupported operating system`,
    });
    return;
  }

  // Execute the proxy command
  if (process.platform === "win32") {
    exec(proxyCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("Error checking proxy settings:", stderr);
        mainWindow.webContents.send("proxy:check:error", {
          msg: `error : ${stderr}`,
        });
        dynamicWindow.webContents.send("proxy:check:error", {
          msg: `error : ${stderr}`,
        });
        return;
      }

      // Check the result and print the proxy settings
      console.log("Proxy Settings:");
      const proxy = stdout.split(" ");
      const currentProxy = proxy[proxy.length - 1].trim();
      console.log({ currentProxy });

      mainWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${currentProxy}`,
        proxy: currentProxy,
      });
      dynamicWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${currentProxy}`,
        proxy: currentProxy,
      });

      // localStorage.setItem("currentProxy", currentProxy);

      // Save the proxy settings in electron-settings
      // settings.set("currentProxy", currentProxy);
    });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  // checkProxy();
  // showNotification();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
// app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

var proxyManagerSudo = null;

// respond to ipcRenderer
ipcMain.on("proxy:set", (e, options) => {
  console.log(options);
  setProxy(
    `http://${options.ipAddress}:${options.port}`,
    options.ipAddress,
    options.port
  );
  // setProxyForVSCode(`https://${options.ipAddress}:${options.port}`);
  setProxyForPip(`https://${options.ipAddress}:${options.port}`);
  if (!isLinux && !isMac) {
    setSystemEnvironmentVariables(
      `http://${options.ipAddress}:${options.port}`
    );
  }
  // for linux manage all proxy with sudo
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("proxyManagerSudo");', true)
    .then(async (result) => {
      console.log({ result });
      proxyManagerSudo = result;
      result !== null && isLinux
        ? await setLinuxAllProxyPrompt(options.ipAddress, options.port)
        : null;
      result !== null && isMac
        ? await setMacAllNetworkProxy(options.ipAddress, options.port)
        : null;
    });

  if (isMac) {
    setMacAllProxy(options.ipAddress, options.port, "USB 10/100/1000 LAN");
  }
});
ipcMain.on("proxy:unset", (e, options) => {
  console.log(options);
  unsetProxy();
  // unsetProxyForVSCode();
  unsetProxyForPip();
  if (!isLinux && !isMac) {
    unsetSystemEnvironmentVariables();
  }
  // for linux manage all proxy with sudo
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("proxyManagerSudo");', true)
    .then(async (result) => {
      console.log({ result });
      proxyManagerSudo = result;
      result !== null && isLinux ? await unsetLinuxAllProxyPrompt() : null;
      result !== null && isMac ? await unsetMacAllNetworkProxy() : null;
    });
  if (isMac) {
    unsetMacAllProxy("USB 10/100/1000 LAN");
  }
});
ipcMain.on("proxy:check", (e, options) => {
  console.log(options);
  checkProxy();
});
ipcMain.on("custom-form:accepted", (e, options) => {
  mainWindow.webContents.send("form-accepted", {
    msg: "success : new proxy added",
  });
});

// Promisified exec function
const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log({ error });
        reject({ command, error, stderr });
      } else {
        resolve({ command, stdout });
      }
    });
  });
};

// change proxy and send using webcontents
async function setProxy(proxyServer, host, port) {
  console.log(proxyServer);
  const allCommands = [];
  const servicesUpdated = [];
  // git
  const gitPromise = new Promise((resolve) => {
    exec("git --version", async (error, stdout, stderr) => {
      if (error) {
        console.error("Git error : ", stderr);
        resolve();
      } else {
        console.log({ stdout });
        // allCommands.push(`git config --global http.proxy ${proxyServer}`);
        // allCommands.push(`git config --global https.proxy ${proxyServer}`);
        await execPromise(`git config --global http.proxy ${proxyServer}`);
        await execPromise(`git config --global https.proxy ${proxyServer}`);
        servicesUpdated.push(`git`);
        resolve();
      }
    });
  });
  // npm
  const npmPromise = new Promise(async (resolve) => {
    exec("npm --version", async (error, stdout, stderr) => {
      if (error) {
        console.error("npm error : ", stderr);
        resolve();
      } else {
        console.log({ stdout });
        allCommands.push(`npm config set proxy ${proxyServer}`);
        await execPromise(`npm config set proxy ${proxyServer}`);
        allCommands.push(`npm config set https-proxy ${proxyServer}`);
        await execPromise(`npm config set https-proxy ${proxyServer}`);
        servicesUpdated.push(`npm`);
        resolve();
      }
    });
  });

  if (process.platform === "win32") {
    // Windows
    allCommands.push(
      `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${host}:${port} /f`
    );
    allCommands.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f'
    );
  } else if (process.platform === "linux") {
    // Linux
    allCommands.push(`gsettings set org.gnome.system.proxy mode 'manual'`);
    allCommands.push(
      `gsettings set org.gnome.system.proxy.http host '${host}'`
    );
    allCommands.push(`gsettings set org.gnome.system.proxy.http port ${port}`);
    allCommands.push(
      `gsettings set org.gnome.system.proxy.https host '${host}'`
    );
    allCommands.push(`gsettings set org.gnome.system.proxy.https port ${port}`);
  } else if (process.platform === "darwin") {
    // macOS
    allCommands.push(`networksetup -setwebproxy Wi-Fi ${host} ${port}`);
    allCommands.push(`networksetup -setsecurewebproxy Wi-Fi ${host} ${port}`);
  } else {
    console.error("Unsupported operating system");
    return;
  }
  Promise.all([gitPromise, npmPromise]).then(() => {
    allCommands.map((command) =>
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("Got an Error : ", stderr);
          mainWindow.webContents.send("proxy:error", { msg: stderr });
          mainWindow.webContents.send("proxy:sys:complete", {
            msg: "completed",
          });
          return;
        }
        console.log({ stdout });
        console.log(`command executed successfully: ${command}`);
      })
    );
    process.env.HTTP_PROXY = proxyServer;
    process.env.HTTPS_PROXY = proxyServer;
    console.log({ servicesUpdated });
    mainWindow.webContents.send("proxy:success", {
      msg: `success : set system, ${servicesUpdated.join(", ")}`,
    });
    mainWindow.webContents.send("proxy:sys:complete", {
      msg: "completed",
    });
  });
}

// console.log({ lol: process.env.HTTPS_PROXY });

async function unsetProxy() {
  const allCommands = [];
  const servicesUpdated = [];
  // git
  const gitPromise = new Promise((resolve) => {
    exec("git --version", async (error, stdout, stderr) => {
      if (error) {
        console.error("Git error : ", stderr);
        resolve();
      } else {
        console.log({ stdout });
        // allCommands.push(`git config --global --unset http.proxy`);
        // allCommands.push(`git config --global --unset https.proxy`);
        await execPromise(`git config --global --unset http.proxy`);
        await execPromise(`git config --global --unset https.proxy`);
        servicesUpdated.push(`git`);
        resolve();
      }
    });
  });
  // npm
  const npmPromise = new Promise((resolve) => {
    exec("npm --version", async (error, stdout, stderr) => {
      if (error) {
        console.error("npm error : ", stderr);
        resolve();
      } else {
        console.log({ stdout });
        // allCommands.push(`npm config rm proxy`);
        await execPromise(`npm config rm proxy`);
        // allCommands.push(`npm config rm https-proxy`);
        await execPromise(`npm config rm https-proxy`);
        servicesUpdated.push(`npm`);
        resolve();
      }
    });
  });

  // Determine the operating system
  if (process.platform === "win32") {
    // Windows
    allCommands.push(
      'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /f'
    );
    allCommands.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f'
    );
  } else if (process.platform === "linux") {
    // Linux
    allCommands.push('gsettings set org.gnome.system.proxy mode "none"');
  } else if (process.platform === "darwin") {
    // macOS
    allCommands.push('networksetup -setwebproxy Wi-Fi "" ""');
    allCommands.push('networksetup -setsecurewebproxy Wi-Fi "" ""');
  } else {
    console.error("Unsupported operating system");
    return;
  }
  Promise.all([gitPromise, npmPromise]).then(() => {
    allCommands.map(
      async (command) =>
        await exec(command, async (error, stdout, stderr) => {
          if (error) {
            console.error("Got an Error : ", stderr);
            await mainWindow.webContents.send("proxy:error", { msg: stderr });
            await mainWindow.webContents.send("proxy:sys:complete", {
              msg: "completed",
            });
            return;
          }
          console.log({ stdout });
          console.log(`command executed successfully: ${command}`);
        })
    );

    // Unset environment variables (HTTP_PROXY, HTTPS_PROXY)
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    mainWindow.webContents.send("proxy:success", {
      msg: `success : unset system, ${servicesUpdated.join(", ")}`,
    });
    mainWindow.webContents.send("proxy:sys:complete", {
      msg: "completed",
    });
  });
}

function setProxyForVSCode(proxyServer) {
  const settingsJsonPath = `${
    process.env.HOME || process.env.USERPROFILE
  }/AppData/Roaming/Code/User/settings.json`;

  const vscodeCommands = [
    `code --install-extension Shan.code-settings-sync`,
    `code --force ${settingsJsonPath} --install-extension Shan.code-settings-sync`,
    `code --force ${settingsJsonPath} --set "http.proxy" "${proxyServer}"`,
    `code --force ${settingsJsonPath} --set "http.proxyStrictSSL" false`,
    `code --force ${settingsJsonPath} --set "https.proxy" "${proxyServer}"`,
    `code --force ${settingsJsonPath} --set "https.proxyStrictSSL" false`,
  ];

  vscodeCommands.forEach(async (command) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing VSCode command: ${command}`, stderr);
        await mainWindow.webContents.send("proxy:error", { msg: stderr });
        return;
      } else {
        console.log(`VSCode command executed successfully: ${command}`);
      }
    });
  });
  mainWindow.webContents.send("proxy:success", { msg: "success : set vsc" });
}

function setProxyForPip(proxyServer) {
  var pipCommands = [];
  exec("pip --version", async (error, stdout, stderr) => {
    if (error) {
      console.error("pip error : ", stderr);
      // mainWindow.webContents.send("proxy:warning", {
      //   msg: "info: pip not found",
      // });
      return;
    } else {
      console.log({ stdout });
      pipCommands = [
        `pip config set global.proxy ${proxyServer}`,
        `pip config set global.trusted-host pypi.python.org`,
      ];
      pipCommands.forEach(async (command) => {
        exec(command, async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing pip command: ${command}`, stderr);
            await mainWindow.webContents.send("proxy:error", {
              msg: "Error for pip: try again",
            });
            return;
          } else {
            console.log(`pip command executed successfully: ${command}`);
          }
        });
      });
      await mainWindow.webContents.send("proxy:success", {
        msg: "success : set pip",
      });
    }
  });
}

function unsetProxyForVSCode() {
  const settingsJsonPath = `${
    process.env.HOME || process.env.USERPROFILE
  }/AppData/Roaming/Code/User/settings.json`;

  const vscodeCommands = [
    `code --force ${settingsJsonPath} --remove "http.proxy"`,
    `code --force ${settingsJsonPath} --remove "http.proxyStrictSSL"`,
    `code --force ${settingsJsonPath} --remove "https.proxy"`,
    `code --force ${settingsJsonPath} --remove "https.proxyStrictSSL"`,
  ];

  vscodeCommands.forEach(async (command) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing VSCode command: ${command}`, stderr);
        await mainWindow.webContents.send("proxy:error", { msg: stderr });
        return;
      } else {
        console.log(`VSCode command executed successfully: ${command}`);
      }
    });
  });
  mainWindow.webContents.send("proxy:success", { msg: "success : unset vsc" });
}

function unsetProxyForPip() {
  var pipCommands = [];
  exec("pip --version", async (error, stdout, stderr) => {
    if (error) {
      console.error("pip error : ", stderr);
      // mainWindow.webContents.send("proxy:warning", {
      //   msg: "info: pip not found",
      // });
      return;
    } else {
      console.log({ stdout });
      pipCommands = [
        "pip config unset global.proxy",
        "pip config unset global.trusted-host",
      ];
      pipCommands.forEach(async (command) => {
        exec(command, async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing pip command: ${command}`, stderr);
            await mainWindow.webContents.send("proxy:error", {
              msg: "Error for pip: first apply a proxy then try removing",
            });
            // return;
          } else {
            console.log(`pip command executed successfully: ${command}`);
          }
        });
      });
      await mainWindow.webContents.send("proxy:success", {
        msg: "success : unset pip",
      });
    }
  });
}

function setSystemEnvironmentVariables(proxyServer) {
  // Determine the operating system
  if (process.platform === "win32") {
    // Windows
    const commands = [
      `setx HTTP_PROXY ${proxyServer}`,
      `setx HTTPS_PROXY ${proxyServer}`,
    ];

    commands.forEach(async (command) => {
      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${command}`, stderr);
          await mainWindow.webContents.send("proxy:error", {
            msg: "Some Error occured, Please select the Proxy again",
          });
          return;
        } else {
          console.log(`Command executed successfully: ${command}`);
        }
      });
    });
    mainWindow.webContents.send("proxy:success", {
      msg: "success : set system environment variables",
    });
    process.env.HTTP_PROXY = proxyServer;
    process.env.HTTPS_PROXY = proxyServer;
  } else {
    console.error(
      "Setting system environment variables is only supported on Windows."
    );
    // mainWindow.webContents.send("proxy:warning", {
    //   msg: "warning : system environment variables is only supported on Windows",
    // });
  }
}

function unsetSystemEnvironmentVariables() {
  // Determine the operating system
  if (process.platform === "win32") {
    // Windows
    var commands = ['setx HTTP_PROXY ""', 'setx HTTPS_PROXY ""'];
    commands.forEach(async (command) => {
      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${command}`, stderr);
          await mainWindow.webContents.send("proxy:warning", {
            msg: "No Enviroment Variable Present",
          });
          return;
        } else {
          console.log(`Command executed successfully: ${command}`);
        }
      });
    });
    mainWindow.webContents.send("proxy:success", {
      msg: "success : unset system environment variables",
    });
  } else {
    console.error(
      "Unsetting system environment variables is only supported on Windows."
    );
    // mainWindow.webContents.send("proxy:warning", {
    //   msg: "warning : system environment variables is only supported on Windows",
    // });
  }
}

async function setLinuxAllProxy(host, port) {
  const proxyserver = `http://${host}:${port}`;
  const commandsEnv = `echo ${proxyManagerSudo} | sudo -S -k tee -a /etc/environment << EOF
  http_proxy=${proxyserver}
  https_proxy=${proxyserver}
  ftp_proxy=${proxyserver}
  no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com,127.0.0.0/8,::1"
  HTTP_PROXY=${proxyserver}
  HTTPS_PROXY=${proxyserver}
  FTP_PROXY=${proxyserver}
  NO_PROXY="localhost,127.0.0.1,localaddress,.localdomain.com,127.0.0.0/8,::1"
EOF`;
  const commandsApt = `echo ${proxyManagerSudo} | sudo -S -k tee /etc/apt/apt.conf.d/proxyManager << EOF
    Acquire::http::proxy "http://${host}:${port}/";
    Acquire::ftp::proxy "ftp://${host}:${port}/";
    Acquire::https::proxy "https://${host}:${port}/";
EOF`;
  // await execPromise(commandsEnv);
  // await execPromise(commandsApt);
  exec(commandsEnv, (error, stdout, stderr) => {
    if (error) {
      console.error("Got an Error : ", stderr);
      mainWindow.webContents.send("proxy:error", { msg: stderr });
      return;
    }
    console.log({ stdout });
    console.log(`command executed successfully: ${command}`);
    mainWindow.webContents.send("proxy:success", {
      msg: `success : set system, linux sudo env`,
    });
  });
  exec(commandsApt, (error, stdout, stderr) => {
    k;
    if (error) {
      console.error("Got an Error : ", stderr);
      mainWindow.webContents.send("proxy:error", { msg: stderr });
      return;
    }
    console.log({ stdout });
    console.log(`command executed successfully: ${command}`);
    mainWindow.webContents.send("proxy:success", {
      msg: `success : set system, linux sudo apt`,
    });
  });
  console.log({ servicesUpdated });
}

async function unsetLinuxAllProxy() {
  // const proxyserver = `http://${host}:${port}`;
  const commandsEnv = `echo ${proxyManagerSudo} | sudo -S -k rm /etc/environment &&
  echo ${proxyManagerSudo} | sudo -S -k tee /etc/environment << EOF
  PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
EOF`;
  const commandsApt = `echo ${proxyManagerSudo} | sudo -S -k rm /etc/apt/apt.conf.d/proxyManager`;
  // await execPromise(commandsEnv);
  // await execPromise(commandsApt);
  exec(commandsEnv, (error, stdout, stderr) => {
    if (error) {
      console.error("Got an Error : ", stderr);
      mainWindow.webContents.send("proxy:error", { msg: stderr });
      return;
    }
    console.log({ stdout });
    console.log(`command executed successfully: ${command}`);
    mainWindow.webContents.send("proxy:success", {
      msg: `success : unset system, linux sudo env`,
    });
  });
  exec(commandsApt, (error, stdout, stderr) => {
    if (error) {
      console.error("Got an Error : ", stderr);
      mainWindow.webContents.send("proxy:error", { msg: stderr });
      return;
    }
    console.log({ stdout });
    console.log(`command executed successfully: ${command}`);
    mainWindow.webContents.send("proxy:success", {
      msg: `success : unset system, linux sudo apt`,
    });
  });
  console.log({ servicesUpdated });
}

// linux sudo using sudo-prompt
var options = {
  name: "Proxy Manager",
  icns: "../public/icons/icon_256.icns",
};

async function setLinuxAllProxyPrompt(host, port) {
  mainWindow.webContents.send("proxy:sys:started", {
    msg: "started",
  });
  const proxyserver = `http://${host}:${port}`;
  const commandsEnv = `
    http_proxy=${proxyserver}
    https_proxy=${proxyserver}
    ftp_proxy=${proxyserver}
    no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com,127.0.0.0/8,::1"
    HTTP_PROXY=${proxyserver}
    HTTPS_PROXY=${proxyserver}
    FTP_PROXY=${proxyserver}
    NO_PROXY="localhost,127.0.0.1,localaddress,.localdomain.com,127.0.0.0/8,::1"
  `;

  const commandsApt = `
    Acquire::http::proxy "http://${host}:${port}/";
    Acquire::ftp::proxy "ftp://${host}:${port}/";
    Acquire::https::proxy "https://${host}:${port}/";
  `;
  sudo.exec(
    `tee -a /etc/environment << EOF
    ${commandsEnv}
EOF
tee /etc/apt/apt.conf.d/proxyManager << EOF
${commandsApt}
EOF`,
    options,
    (error, stdout, stderr) => {
      if (error) {
        console.error("Got an Error:", stderr);
        // alert(stderr);
        mainWindow.webContents.send("proxy:warning", {
          msg: "Sudo implementation failed",
        });
        return;
      }
      console.log({ stdout });
      console.log("Command executed successfully for environment variables.");
      mainWindow.webContents.send("proxy:success", {
        msg: "Success: Set env, APT proxy using sudo",
      });
      mainWindow.webContents.send("proxy:sys:complete", {
        msg: "completed",
      });
    }
  );
  //   sudo.exec(
  //     `tee /etc/apt/apt.conf.d/proxyManager << EOF
  //     ${commandsApt}
  // EOF`,
  //     options,
  //     (error, stdout, stderr) => {
  //       if (error) {
  //         console.error("Got an Error:", stderr);
  //         mainWindow.webContents.send("proxy:error", { msg: stderr });
  //         return;
  //       }
  //       console.log({ stdout });
  //       console.log("Command executed successfully for APT configuration.");
  //       mainWindow.webContents.send("proxy:success", {
  //         msg: "Success: Set system, Linux sudo apt",
  //       });
  //     }
  //   );
}

async function unsetLinuxAllProxyPrompt() {
  mainWindow.webContents.send("proxy:sys:started", {
    msg: "started",
  });
  const commandsEnv = `sed -i '/http_proxy=/d; /https_proxy=/d; /ftp_proxy=/d; /no_proxy=/d; /HTTP_PROXY=/d; /HTTPS_PROXY=/d; /FTP_PROXY=/d; /NO_PROXY=/d' /etc/environment
  `;
  //   const commandsEnv = `
  //     rm /etc/environment &&
  //     tee /etc/environment << EOF
  //     PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
  // EOF`;

  const commandsApt = `rm /etc/apt/apt.conf.d/proxyManager`;

  sudo.exec(
    `${commandsEnv}
${commandsApt}`,
    options,
    (error, stdout, stderr) => {
      if (error) {
        console.error("Got an Error:", stderr);
        // alert(stderr);
        mainWindow.webContents.send("proxy:warning", {
          msg: "Sudo implementation failed",
        });
        return;
      }
      console.log({ stdout });
      console.log("Command executed successfully for environment variables.");
      mainWindow.webContents.send("proxy:success", {
        msg: "Success: Unset env, APT proxy using sudo",
      });
      mainWindow.webContents.send("proxy:sys:complete", {
        msg: "completed",
      });
    }
  );

  // sudo.exec(`${commandsApt}`, options, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error("Got an Error:", stderr);
  //     mainWindow.webContents.send("proxy:error", { msg: stderr });
  //     return;
  //   }
  //   console.log({ stdout });
  //   console.log("Command executed successfully for APT configuration.");
  //   mainWindow.webContents.send("proxy:success", {
  //     msg: "Success: Unset system, Linux sudo apt",
  //   });
  // });
}

async function setMacAllProxy(host, port, network) {
  mainWindow.webContents.send("proxy:sys:started", {
    msg: "started",
  });
  const allCommands = [
    `networksetup -setmanual "${network}" 192.168.212.82 255.255.240.0 192.168.208.1`,
    `networksetup -setwebproxy "${network}" ${host} ${port}`,
    `networksetup -setsecurewebproxy "${network}" ${host} ${port}`,
  ];
  await allCommands.map((command) =>
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Got an Error : ", stderr);
        return;
      }
      console.log({ stdout });
      console.log(`command executed successfully: ${command}`);
    })
  );
  mainWindow.webContents.send("proxy:sys:complete", {
    msg: "completed",
  });
}

async function unsetMacAllProxy(network) {
  mainWindow.webContents.send("proxy:sys:started", {
    msg: "started",
  });
  const allCommands = [
    `networksetup -setwebproxy "${network}" "" ""`,
    `networksetup -setsecurewebproxy "${network}" "" ""`,
  ];
  await allCommands.map((command) =>
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Got an Error : ", stderr);
        // mainWindow.webContents.send("debug", {
        //   msg: stderr,
        //   command: command,
        // });
        return;
      }
      console.log({ stdout });
      console.log(`command executed successfully: ${command}`);
      // mainWindow.webContents.send("debug", {
      //   msg: stdout,
      //   command: command,
      // });
    })
  );
  mainWindow.webContents.send("proxy:sys:complete", {
    msg: "completed",
  });
}

async function setMacAllNetworkProxy(host, port) {
  // let proxyCommand = "networksetup -listallhardwareports";
  let proxyCommand = "networksetup -listallnetworkservices";
  exec(proxyCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error checking darwin wifi proxy settings:", stderr);
      mainWindow.webContents.send("proxy:check:error", {
        msg: `error : can't get mac's networks`,
      });
    }

    const allNetworks = stdout
      .trim()
      .split("\n")
      .map((line) => line.trim());

    for (let i = 1; i < allNetworks.length; i++) {
      console.log(allNetworks[i]);
      setMacAllProxy(host, port, allNetworks[i]);
    }
  });
}

async function unsetMacAllNetworkProxy() {
  // let proxyCommand = "networksetup -listallhardwareports";
  let proxyCommand = "networksetup -listallnetworkservices";
  exec(proxyCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error checking darwin wifi proxy settings:", stderr);
      mainWindow.webContents.send("proxy:check:error", {
        msg: `error : can't get mac's networks`,
      });
    }

    const allNetworks = stdout
      .trim()
      .split("\n")
      .map((line) => line.trim());

    for (let i = 1; i < allNetworks.length; i++) {
      console.log(allNetworks[i]);
      unsetMacAllProxy(allNetworks[i]);
    }
  });
}

// async function setMacAllProxyPrompt(host, port) {
//   const proxyserver = `http://${host}:${port}`;
//   const commandsEnv = `
//     http_proxy=${proxyserver}
//     https_proxy=${proxyserver}
//     ftp_proxy=${proxyserver}
//     no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com,127.0.0.0/8,::1"
//     HTTP_PROXY=${proxyserver}
//     HTTPS_PROXY=${proxyserver}
//     FTP_PROXY=${proxyserver}
//     NO_PROXY="localhost,127.0.0.1,localaddress,.localdomain.com,127.0.0.0/8,::1"
//     ALL_PROXY=${proxyserver}
//     all_proxy=${proxyserver}
//   `;
//   const cmd = `tee -a /etc/environment << EOF
//   ${commandsEnv}
// EOF`;
//   MacEnvCmd = `osascript -e "do shell script \"${cmd}\" with administrator privileges"`;

//   exec(MacEnvCmd, (error, stdout, stderr) => {
//     if (error) {
//       console.error("Got an Error:", stderr);
//       // alert(stderr);
//       mainWindow.webContents.send("proxy:warning", {
//         msg: "Sudo implementation failed",
//       });
//       return;
//     }
//     console.log({ stdout });
//     console.log("Command executed successfully for environment variables.");
//     mainWindow.webContents.send("proxy:success", {
//       msg: "Success: Set env using sudo",
//     });
//   });
// }

// async function unsetMacAllProxyPrompt() {
//   const commandsEnv = `sed -i '/http_proxy=/d; /https_proxy=/d; /ftp_proxy=/d; /no_proxy=/d; /HTTP_PROXY=/d; /HTTPS_PROXY=/d; /FTP_PROXY=/d; /ALL_PROXY=/d; /all_proxy=/d; /NO_PROXY=/d' /etc/environment
//   `;
//   const MacEnvCmd =
//     '/usr/bin/osascript -e \'do shell script "bash -c \\"' +
//     commandsEnv +
//     '\\"" with administrator privileges\'';

//   exec(`${MacEnvCmd}`, (error, stdout, stderr) => {
//     if (error) {
//       console.error("Got an Error:", stderr);
//       // alert(stderr);
//       mainWindow.webContents.send("proxy:warning", {
//         msg: "Sudo implementation failed",
//       });
//       return;
//     }
//     console.log({ stdout });
//     console.log("Command executed successfully for environment variables.");
//     mainWindow.webContents.send("proxy:success", {
//       msg: "Success: Unset env using sudo",
//     });
//   });
// }
