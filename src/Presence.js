import Icons from "./Icons.json";
import config from "./main.js";
import { APPLICATION_ID } from "./Plugin.js";

const fs = acode.require("fs");
const Url = acode.require("url");

export class Presence {
  static STATES = {
    TERMINAL: "Using Terminal",
    IDLE: "Idle in editor",
    EDITING: "Editing on a file",
  };

  constructor(rpc) {
    this.rpc = rpc;
    this.settings = rpc.settings;
    this.config = config;
    this.startTimestamp = Date.now();

    // routing editor mode
    if (this.config.editor === "vscode") {
      this.mode = "vscode";
      this.vscodePresence = this.setVSCodePresence();
    } else {
      this.mode = "acode";
    }
  }

  /* =========================
     VS CODE (MANUAL MODE)
     ========================= */
  setVSCodePresence() {
    const vscode = this.config.vscode || {};

    return {
      details: `Editing ${vscode.file || "file"}`,
      state: `Workspace: ${vscode.workspace || "VS Code"}`,
      largeImage: vscode.language || "vscode",
      smallImage: "vscode",
      startTimestamp: this.startTimestamp,
    };
  }

  /* =========================
     DISCORD RPC PAYLOAD
     ========================= */
  async getPresence() {
    // VS CODE MODE
    if (this.mode === "vscode") {
      return {
        since: null,
        afk: false,
        status: "online",
        activities: [
          {
            name: "Visual Studio Code",
            type: 0,
            application_id: APPLICATION_ID,
            details: this.vscodePresence.details,
            state: this.vscodePresence.state,
            assets: {
              large_image: this.vscodePresence.largeImage,
              large_text: "Visual Studio Code",
              small_image: this.vscodePresence.smallImage,
              small_text: "VS Code",
            },
            timestamps: {
              start: this.startTimestamp,
            },
          },
        ],
      };
    }

    // ACODE MODE (LOGIC LAMA, AMAN)
    return {
      since: null,
      afk: this.isAFK,
      status: this.status,
      activities: [
        {
          name: BuildInfo.displayName,
          type: 0,
          application_id: APPLICATION_ID,
          state: this.state,
          details: this.details,
          assets: {
            large_image: this.largeImage,
            large_text: BuildInfo.displayName,
            small_image: this.smallImage,
            small_text: this.currentLanguage,
          },
        },
      ],
    };
  }

  /* =========================
     ACODE HELPERS (ASLI)
     ========================= */
  get isAFK() {
    return !!this.settings.presence.isAFK;
  }

  get status() {
    if (
      this.settings.config.forceOffline &&
      this.rpc.ws.status === "offline"
    )
      return "online";
    return this.rpc.ws.status;
  }

  get state() {
    const { activeFile } = editorManager;
    if (activeFile.type === "terminal") return Presence.STATES.TERMINAL;
    if (!activeFile.session || activeFile.id === "default-session")
      return Presence.STATES.IDLE;
    if (!this.settings.config.showFileName)
      return Presence.STATES.EDITING;
    return Presence.STATES.EDITING.replace("a file", activeFile.filename);
  }

  get details() {
    const { activeFile } = editorManager;
    if (addedFolder.length === 0) return null;

    const project = addedFolder.find((f) =>
      activeFile?.uri?.startsWith(f?.url)
    );
    if (!project || !project.url) return;

    if (!project.title || !this.settings.config.showProjectName)
      return "In a workspace";
    return `Workspace: ${project.title}`;
  }

  get currentLanguage() {
    const { activeFile } = editorManager;
    if (!activeFile.session) return;
    return activeFile.session?.$mode?.$id?.split("/")?.pop();
  }

  get largeImage() {
    switch (this.state) {
      case Presence.STATES.TERMINAL:
        return Icons.terminal;
      case Presence.STATES.IDLE:
        return Icons.idle;
      default:
        if (!this.settings.config.showFileName) return Icons.editing;
        return Icons[this.currentLanguage] || Icons.editing;
    }
  }

  get smallImage() {
    return Icons.acode;
  }
}
