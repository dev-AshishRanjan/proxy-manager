module.exports = {
  packagerConfig: {
    asar: true,
    executableName: "proxy-manager",
    icon: "./public/icons/icon_256",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        icon: "./public/icons/icon_256.ico",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {
        icon: "./public/icons/icon_256.icns",
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        background: './public/icons/icon_256.png',
        format: 'ULFO'
      }
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: "./public/icons/icon_256.ico",
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          icon: "./public/icons/icon_256.ico",
        },
      },
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "dev-AshishRanjan",
          name: "proxy-manager",
        },
        draft: true,
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
};
