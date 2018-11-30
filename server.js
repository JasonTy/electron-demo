const SSH = require('simple-ssh');

class SSHServer {
    constructor (option) {
        this.host = option.host;
        this.user = option.user;
        this.pass = option.pass;
    }

    // 联机远程服务器
    async _connection () {
        const ssh =  new SSH({
            user: this.user,
            host: this.host,
            pass: this.pass
        });
        // 执行默认操作
        const result = await this._exec('ls', ssh);
        return {ssh, result};
    }

    // 执行相关命令
    async _exec (shell, ssh) {
        return this._shell(shell, ssh);
    }

    // 执行命令
    _shell (shell, ssh) {
        return new Promise((resolve, reject) => {
             ssh.exec(shell, {
                out: function (stdout) {
                    resolve(stdout);
                },
                start: function () {

                }
            }).start();
        });
    }

    // 查看当前执行命令个数
    _count (ssh) {
        return new Promise((resolve, reject) => {
            resolve(ssh.count());
        });
    }
}

module.exports = SSHServer;