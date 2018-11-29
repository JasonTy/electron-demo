const {app, BrowserWindow, ipcMain} = require('electron');
const server = require('./server');



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let host = '';
let user = '';
let pass = '';
let ssh;
let serverObj;

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
app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        createWindow()
    }
});

// 监听渲染进程发送的消息
ipcMain.on('asynchronous-message', async (event, sshstr) => {
    let result;
    try {
        if (sshstr.indexOf('ssh') > -1) {
            const strUrl = sshstr.split(' ').slice(1).join('').split('@');
            host = strUrl[1], user = strUrl[0], pass = strUrl[2];
            serverObj = new server({
                host,
                user,
                pass
            });
            const result01 = await serverObj._connection();
            ssh = result01.ssh;
            result = result01.result;
        } else {
            let newSshStr = sshstr;
            result = await serverObj._exec(newSshStr, ssh);
        }
    } catch (e) {
        app.quit();
    }

    // 发送消息到渲染进程
    event.sender.send('asynchronous-reply', {result, sshstr});
});

