/* Electron entry point: opens the built app (dist/index.html) in a
   desktop window. All data (progress, drafts) lives in localStorage,
   which Electron persists in the user's profile directory. */
const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 820,
    minWidth: 360,
    minHeight: 520,
    backgroundColor: "#13151a",
    autoHideMenuBar: true, // Windows/Linux: menu hidden, Alt shows it; macOS keeps its menu for Cmd+C/V
    title: "Deutsch A0–B1",
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));

  // open external links in the system browser, not inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
