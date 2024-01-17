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
// const settings = require("electron-settings");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const isMac = process.platform === "darwin";
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

const NOTIFICATION_TITLE = "Basic Notification";
const NOTIFICATION_BODY = "Notification from the Main process";

function showNotification() {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
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
              accelerator: "CmdOrCtrl+I",
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
              accelerator: "CmdOrCtrl+P",
            },
            {
              label: "Add Custom Proxy",
              click: () => createDynamicWindow("custom.html"),
              accelerator: "CmdOrCtrl+K",
            },
            {
              type: "separator",
            },
            {
              label: "Check Internet Speed",
              click: () => createURLWindow(),
              accelerator: "CmdOrCtrl+F",
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
              accelerator: "CmdOrCtrl+I",
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
              accelerator: "CmdOrCtrl+P",
            },
            {
              label: "Add Custom Proxy",
              click: () => createDynamicWindow("custom.html"),
              accelerator: "CmdOrCtrl+K",
            },
            {
              type: "separator",
            },
            {
              label: "Check Internet Speed",
              click: () => createURLWindow(),
              accelerator: "CmdOrCtrl+F",
            },
            {
              label: "Open Dev Tools",
              click: () => mainWindow.webContents.openDevTools(),
              accelerator: "CmdOrCtrl+O",
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
    proxyCommand = "env | grep -i proxy";
  } else if (process.platform === "darwin") {
    proxyCommand = "networksetup -getwebproxy Wi-Fi";
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
    if (process.platform === "linux") {
      // checking proxy
      var linuxProxy;
      if (currentProxy.includes("HTTP_PROXY")) {
        // proxy present
        const temp = currentProxy.split("HTTP_PROXY=");
        linuxProxy = temp[temp.length - 1];
      } else {
        // no proxy
        linuxProxy = undefined;
      }
      mainWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${linuxProxy}`,
        proxy: linuxProxy,
      });
      dynamicWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${linuxProxy}`,
        proxy: linuxProxy,
      });
    } else {
      mainWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${currentProxy}`,
        proxy: currentProxy,
      });
      dynamicWindow.webContents.send("proxy:check:success", {
        msg: `current system proxy : ${currentProxy}`,
        proxy: currentProxy,
      });
    }
    // localStorage.setItem("currentProxy", currentProxy);

    // Save the proxy settings in electron-settings
    // settings.set("currentProxy", currentProxy);
  });
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
  setSystemEnvironmentVariables(`http://${options.ipAddress}:${options.port}`);
});
ipcMain.on("proxy:unset", (e, options) => {
  console.log(options);
  unsetProxy();
  // unsetProxyForVSCode();
  unsetProxyForPip();
  unsetSystemEnvironmentVariables();
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
        reject({ command, error, stderr });
      } else {
        resolve({ command, stdout });
      }
    });
  });
};

// change proxy and send using webcontents
function setProxy(proxyServer, host, port) {
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
  const npmPromise = new Promise((resolve) => {
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
  });
}

// console.log({ lol: process.env.HTTPS_PROXY });

function unsetProxy() {
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
    allCommands.push('networksetup -setwebproxy Wi-Fi "" 0');
    allCommands.push('networksetup -setsecurewebproxy Wi-Fi "" 0');
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
            await mainWindow.webContents.send("proxy:error", { msg: stderr });
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
            await mainWindow.webContents.send("proxy:error", { msg: stderr });
            return;
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
          await mainWindow.webContents.send("proxy:error", { msg: stderr });
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
    mainWindow.webContents.send("proxy:warning", {
      msg: "warning : system environment variables is only supported on Windows",
    });
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
    mainWindow.webContents.send("proxy:warning", {
      msg: "warning : system environment variables is only supported on Windows",
    });
  }
}