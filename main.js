const {app, BrowserWindow, ipcMain} = require('electron');
const SSH = require('simple-ssh');
const cp = require('child_process');



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
    // 创建浏览器窗口。
    win = new BrowserWindow({ width: 800, height: 600 })

    // 然后加载应用的 index.html。
    win.loadFile('index.html')

    // 打开开发者工具
    //win.webContents.openDevTools()

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        createWindow()
    }
});

// 监听渲染进程发送的消息
ipcMain.on('asynchronous-message', async (event, url) => {
    let result;
    try {
        if (!url.indexOf('ssh') > -1) {
            result = await execSSH(url);
        } else {
            result = await execShell(url);
        }
    } catch (e) {
        app.quit()
    }

    // 发送消息到渲染进程
    event.sender.send('asynchronous-reply', result);
});


// 执行ssh命令登录我的服务器
function execSSH(url) {
    return new Promise((resolve, reject) => {
        const strUrl = url.split(' ').slice(1).join('').split('@');
        console.log(strUrl);
        const ssh = new SSH({
            user: strUrl[0],
            host: strUrl[1],
            pass: strUrl[2]
        });

        ssh.exec('ls', {
            out: function(stdout) {
                resolve(stdout);
            }
        }).start();
    });
}

// 执行正常的命令
function execShell(shell) {
    return new Promise((resolve, reject) => {
        cp.exec(shell, function (err, stodout, stoderr) {
            if (err) {
                return reject(err);
            }
            resolve(stodout);
        });
    });
}
