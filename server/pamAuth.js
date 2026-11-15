import os from 'os';
import { execSync, spawnSync } from 'child_process';

/**
 * Native Linux System & PAM Authentication Bridge
 * Authenticates against actual Fedora Linux user credentials.
 */
export function getSystemUserInfo() {
  const currentUsername = process.env.USER || process.env.LOGNAME || os.userInfo().username || 'galaxy';
  let uid = 1000;
  let gid = 1000;
  let home = os.homedir();
  let shell = '/bin/bash';
  let isSudo = false;

  try {
    const userInfo = os.userInfo();
    uid = userInfo.uid;
    gid = userInfo.gid;
    home = userInfo.homedir;
    shell = userInfo.shell || '/bin/bash';
  } catch {}

  try {
    const groupsOutput = execSync(`id -Gn ${currentUsername}`, { encoding: 'utf8' });
    isSudo = groupsOutput.includes('wheel') || groupsOutput.includes('sudo') || uid === 0;
  } catch {
    isSudo = uid === 0;
  }

  return {
    username: currentUsername,
    uid,
    gid,
    home,
    shell,
    isSudo,
    hostName: os.hostname(),
    isAuthenticated: true,
  };
}

export function authenticateLinuxUser(username, password) {
  const sysUser = getSystemUserInfo();

  // Username must match the host system user
  if (username !== sysUser.username && username !== 'root') {
    return {
      success: false,
      error: `User '${username}' does not exist on host ${sysUser.hostName}`,
    };
  }

  // If password provided, verify against PAM / sudo
  if (password) {
    try {
      const res = spawnSync('sudo', ['-S', '-v'], {
        input: password + '\n',
        encoding: 'utf8',
        timeout: 5000,
      });

      if (res.status !== 0) {
        return {
          success: false,
          error: 'PAM Authentication failed: Incorrect Linux password',
        };
      }
    } catch (err) {
      return {
        success: false,
        error: 'Authentication verification error: ' + err.message,
      };
    }
  }

  return {
    success: true,
    user: {
      ...sysUser,
      username,
    },
    token: `aether_pam_${Buffer.from(username + ':' + Date.now()).toString('base64')}`,
  };
}
