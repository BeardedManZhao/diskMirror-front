const jokerBoxPopUp = new JokerBox_popUp(document.getElementById("show_area"));

function reloadFsPath(element) {
    let searchParams = DiskMirrorFront.search_Params("path");
    if (element) {
        if (searchParams.length !== 0 && searchParams[searchParams.length - 1] === element) {
            // 代表不需要追加参数
            window.location.href = window.location.href.replaceAll('#', '');
            return;
        }
        window.location.href = window.location.href.replaceAll('#', '') + "&path=" + element;
    } else {
        // 获取到当前层级
        const value = document.querySelector("#diskMirrorPathInput").value;
        reloadFsPath(value ? value : '/');
    }
}

const progressBar = new ProgressBar(document.querySelector(".progress-bar"), (now, max) => `您的盘镜空间使用量为：${DiskMirrorFront.formatBytes(now)}/${DiskMirrorFront.formatBytes(max)}；占比为：${(now / max * 100).toFixed(2)}%`);
const diskMirror = new DiskMirror(indexConfig.server);
// 获取到id 和 口令
const searchParams1 = [DiskMirrorFront.getLatestCookieValue('diskMirror_server_pass')]
const searchParams0 = DiskMirrorFront.search_Params("server_id");
if (searchParams0.length === 0) {
    alert("请输入您的空间id");
    window.location.href = "index.html";
}
if (searchParams1[0] === null) {
    alert("请输入您的空间信息");
    window.location.href = "index.html";
}
const userId = searchParams0[searchParams0.length - 1];
const type = indexConfig.spaceType ? indexConfig.spaceType : 'Binary';

function mkdir() {
    const s = prompt("您要创建的目录名字？", '/xxx/xxx');
    if (!s) {
        return;
    }
    if (s.length !== 0) {
        diskMirror.mkdirs(userId, type, s, (res) => {
            jokerBoxPopUp.show(`${res.fileName} 目录创建成功!! 请刷新查看哦!!!`);
        }, (res) => {
            jokerBoxPopUp.show(`目录创建失败!!${JSON.stringify(res)}`);
        })
    }
}

window.onload = function () {
    let fsList;
    try {
        diskMirror.setSk(parseInt(searchParams1[searchParams1.length - 1]), indexConfig.domain)
        diskMirror.getUrls(userId, type,
            (res) => {
                progressBar.setProgressByValue(res['useSize'], res['maxSize'], 'linear-gradient(to right, rgba(255, 255, 255, 0.5), #8c00ff)')
                fsList = new FS_List('fileName',
                    res['urls'],
                    document.getElementById("fileList_table"),
                    (f) => {
                        if (f.isDir) {
                            jokerBoxPopUp.show(f.fileName + " 是一个文件夹。");
                            return;
                        }
                        diskMirror.downLoad(userId, type, f.fileName, (res) => {
                            window.open(res)
                        })
                    }
                    ,
                    (f) => {
                        diskMirror.remove(
                            userId,
                            type,
                            f.fileName,
                            (res) => {
                                jokerBoxPopUp.show(res.fileName + " 删除成功!!!");
                            })
                    }
                    ,
                    (f) => {
                        const s = prompt("您期望将其重命名为？", f.fileName);
                        if (!s) {
                            return;
                        }
                        diskMirror.reName(
                            userId, type, f.fileName, s,
                            (res) => {
                                jokerBoxPopUp.show(res.fileName + " 重命名成功!!! 刷新可见新数据!");
                            }
                        )
                    },
                    document.querySelector("#diskMirrorPathInput")
                );
                // 判断是否需要路径
                const searchParams = DiskMirrorFront.search_Params('path');
                if (searchParams.length > 0) {
                    fsList.setPath(searchParams[searchParams.length - 1]);
                }
            },
            (e) => {
                progressBar.setProgressByValue(0, 'linear-gradient(to right, rgba(255, 255, 255, 0.5), #8c00ff)')
                progressBar.setProgressByValue(124 << 10 << 10, 128 << 10 << 10, 'linear-gradient(to right, rgba(255, 255, 255, 0.5), #8c00ff)')
                if ('res' in e) {
                    if (e['res'].endsWith("不可读!!!")) {
                        // 这里代表用户是第一次使用 盘镜 所以可能没有目录 但并不代表是发生了错误!!!
                        fsList = new FS_List('fileName',
                            [],
                            document.getElementById("fileList_table"),
                            (f) => {
                                if (f.isDir) {
                                    jokerBoxPopUp.show(f.fileName + " 是一个文件夹。");
                                    return;
                                }
                                diskMirror.downLoad(userId, type, f.fileName, (res) => {
                                    window.open(res)
                                })
                            }
                            ,
                            (f) => {
                                diskMirror.remove(
                                    userId,
                                    type,
                                    f.fileName,
                                    (res) => {
                                        jokerBoxPopUp.show(res.fileName + " 删除成功!!!");
                                    })
                            }
                            ,
                            (fileName) => {
                                console.log('reName', fileName);
                                jokerBoxPopUp.show("还没接入重命名操作!")
                            },
                            document.querySelector("#diskMirrorPathInput")
                        );
                        // 判断是否需要路径
                        const searchParams = DiskMirrorFront.search_Params('path');
                        if (searchParams.length > 0) {
                            fsList.setPath(searchParams[searchParams.length - 1]);
                        }
                        return;
                    }
                    console.error(e);
                    new FS_List('fileName', [
                        {
                            fileName: '发生了错误，盘镜资源加载失败: ' + e['res'],
                            fileSize: 0,
                            fileType: 'error',
                            isDir: false
                        },
                    ], document.getElementById("fileList_table"))
                    jokerBoxPopUp.show(e['res'])
                    return;
                }
                new FS_List('fileName', [
                    {
                        fileName: '发生了错误，服务器拒绝操作: ' + e,
                        fileSize: 0,
                        fileType: 'error',
                        isDir: false
                    }
                ], document.getElementById("fileList_table"))
                console.error(e);
                jokerBoxPopUp.show(e)
            })

        document.querySelector("#diskMirrorBackPath").addEventListener("click", () => fsList.toBackPath());

        document.getElementById("diskMirrorSearch").addEventListener("keydown", (e) => {
            if (e.key === 'Enter') {
                const searchStr = document.getElementById("diskMirrorSearch").value;
                jokerBoxPopUp.show('正在当前目录搜索文件名包含 ' + searchStr + ' 的文件！')
                fsList.filter(
                    d => searchStr.length === 0 || d.fileName.includes(searchStr)
                );
            }
        })

        document.getElementById("fileUpload").addEventListener("change", function (e) {
            const files = e.target.files;
            // 获取到当前层级
            const element = document.querySelector("#diskMirrorPathInput").value;
            // 成功记录
            let count = 0;
            let noWarCount = 0;
            for (const file of files) {
                if (file.name.endsWith(".war")) {
                    jokerBoxPopUp.show(`检测到 war 文件，正在将 《${file.name}》 自动解析为一个同名的目录！`)
                    // 代表是 war 文件 需要被解析一下
                    Utils_io.unzipFile(file, (c, f, path, backOk) => {
                        diskMirror.upload({
                            fileName: element + '/' + file.name.substring(0, file.name.length - 4) + '/' + path,
                            userId: userId,
                            type: indexConfig.spaceType
                        }, f, (res) => {
                            res.lastModified = new Date().getTime()
                            jokerBoxPopUp.show(`${file.name} 文件中：批量上传了 ${c} 个文件。`);
                            backOk[0] = true;
                        }, e => {
                            backOk[0] = true;
                            jokerBoxPopUp.show(`${file.name} 中 有文件解压失败!!! ${JSON.stringify(e)}`);
                            console.error(e)
                        })
                    }, () => {
                        jokerBoxPopUp.show(`${file.name} 解压完毕!!!`);
                        if (++noWarCount === files.length) {
                            reloadFsPath(element);
                        }
                    })
                    ++count;
                    return;
                }
                diskMirror.upload({
                    fileName: element + '/' + file.name,
                    userId: userId,
                    type: indexConfig.spaceType
                }, file, (res) => {
                    res.lastModified = new Date().getTime()
                    jokerBoxPopUp.show(`共${files.length} 个文件！目前批量上传了 ${++noWarCount} 个文件。`);
                    if (noWarCount === files.length) {
                        reloadFsPath(element);
                    }
                }, undefined)
            }
        })
    } catch (e) {
        console.error(e);
        new FS_List('fileName', [
            {
                fileName: '发生了错误，盘镜资源处理失败: ' + e,
                fileSize: 0,
                fileType: 'error',
                isDir: false
            }
        ], document.getElementById("fileList_table"))
    }
}