"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
class ServiceManager {
    constructor() {
        this.serviceName = 'omnimind';
        this.serviceFilePath = `/etc/systemd/system/${this.serviceName}.service`;
    }
    installService() {
        const workingDir = process.cwd();
        const nodePath = (0, child_process_1.execSync)('which node').toString().trim();
        const entryPoint = path_1.default.join(workingDir, 'dist/index.js');
        const serviceContent = `[Unit]
Description=OmniMind Personal AI Assistant
After=network.target

[Service]
Type=simple
User=${process.env.USER || 'root'}
WorkingDirectory=${workingDir}
ExecStart=${nodePath} ${entryPoint}
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;
        // Write to a local file first, then tell user how to move it or try to move it if possible
        const localServicePath = path_1.default.join(workingDir, `${this.serviceName}.service`);
        fs_1.default.writeFileSync(localServicePath, serviceContent);
        console.log(`\nService file created at: ${localServicePath}`);
        console.log(`To install, run:`);
        console.log(chalk_1.default.bold(`sudo cp ${localServicePath} /etc/systemd/system/`));
        console.log(chalk_1.default.bold(`sudo systemctl daemon-reload`));
        console.log(chalk_1.default.bold(`sudo systemctl enable --now ${this.serviceName}`));
    }
}
exports.ServiceManager = ServiceManager;
//# sourceMappingURL=ServiceManager.js.map