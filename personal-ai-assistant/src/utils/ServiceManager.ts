import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

export class ServiceManager {
  private serviceName = 'omnimind';
  private serviceFilePath = `/etc/systemd/system/${this.serviceName}.service`;

  installService() {
    const workingDir = process.cwd();
    const nodePath = execSync('which node').toString().trim();
    const entryPoint = path.join(workingDir, 'dist/index.js');

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
    const localServicePath = path.join(workingDir, `${this.serviceName}.service`);
    fs.writeFileSync(localServicePath, serviceContent);
    
    console.log(`\nService file created at: ${localServicePath}`);
    console.log(`To install, run:`);
    console.log(chalk.bold(`sudo cp ${localServicePath} /etc/systemd/system/`));
    console.log(chalk.bold(`sudo systemctl daemon-reload`));
    console.log(chalk.bold(`sudo systemctl enable --now ${this.serviceName}`));
  }
}
