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
// const { exec } = require("child_process");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";

let mainWindow;
let dynamicWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "./app/index.html"));

  // Open the DevTools if dev
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

// create dynamic window
const createDynamicWindow = (file) => {
  dynamicWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  dynamicWindow.loadFile(path.join(__dirname, `./app/${file}`));
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
              label: "Custom",
              click: () => createDynamicWindow("custom.html"),
              accelerator: "CmdOrCtrl+k",
            },
            {
              label: "About",
              click: () => createDynamicWindow("about.html"),
              accelerator: "CmdOrCtrl+i",
            },
            {
              label: "Contact",
              click: () => createDynamicWindow("contact.html"),
              accelerator: "CmdOrCtrl+m",
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
              label: "Custom",
              click: () => createDynamicWindow("custom.html"),
              accelerator: "CmdOrCtrl+k",
            },
            {
              label: "About",
              click: () => createDynamicWindow("about.html"),
              accelerator: "CmdOrCtrl+i",
            },
            {
              label: "Contact",
              click: () => createDynamicWindow("contact.html"),
              accelerator: "CmdOrCtrl+m",
            },
          ],
        },
      ]
    : []),
];

// checking proxy
// const checkProxy = () => {
//   let proxyCommand;

//   // Determine the operating system
//   if (process.platform === "win32") {
//     proxyCommand =
//       'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" | find "ProxyServer"';
//   } else if (process.platform === "linux") {
//     proxyCommand = "env | grep -i proxy";
//   } else if (process.platform === "darwin") {
//     proxyCommand = "networksetup -getwebproxy Wi-Fi";
//   } else {
//     console.error("Unsupported operating system");
//     return;
//   }

//   // Execute the proxy command
//   exec(proxyCommand, (error, stdout, stderr) => {
//     if (error) {
//       console.error("Error checking proxy settings:", stderr);
//       return;
//     }

//     // Check the result and print the proxy settings
//     console.log("Proxy Settings:");
//     const proxy = stdout.split(" ");
//     const currentProxy = proxy[proxy.length - 1].trim();
//     console.log({ currentProxy });
//     // localStorage.setItem("currentProxy", currentProxy);

//     // Save the proxy settings in electron-settings
//     settings.set("currentProxy", currentProxy);
//   });
// };

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
});
ipcMain.on("proxy:unset", (e, options) => {
  console.log(options);
  unsetProxy();
  // unsetProxyForVSCode();
  unsetProxyForPip();
});

// change proxy and send using webcontents
function setProxy(proxyServer, host, port) {
  console.log(proxyServer);
  const allCommands = [];
  // git
  allCommands.push(`git config --global http.proxy ${proxyServer}`);
  allCommands.push(`git config --global https.proxy ${proxyServer}`);
  // npm
  allCommands.push(`npm config set proxy ${proxyServer}`);
  allCommands.push(`npm config set https-proxy ${proxyServer}`);

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
  process.env.HTTP_PROXY = proxyServer;
  process.env.HTTPS_PROXY = proxyServer;
  mainWindow.webContents.send("proxy:success", {
    msg: "success : set system,npm,git",
  });
}

function unsetProxy() {
  const allCommands = [];
  // git
  allCommands.push(`git config --global --unset http.proxy`);
  allCommands.push(`git config --global --unset https.proxy`);
  // npm
  allCommands.push(`npm config rm proxy`);
  allCommands.push(`npm config rm https-proxy`);

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
    msg: "success : unset system,npm,git",
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
  const pipCommands = [
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
  mainWindow.webContents.send("proxy:success", { msg: "success : set pip" });
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
  const pipCommands = [
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
  mainWindow.webContents.send("proxy:success", { msg: "success : unset pip" });
}
