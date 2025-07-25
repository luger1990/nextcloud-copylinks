import {showMessage, showInfo, showSuccess, showWarning, showError} from '@nextcloud/dialogs'
import {registerFileListAction} from "@nextcloud/files";
import {subscribe} from "@nextcloud/event-bus";


console.log('CopyLinks app files.js loaded successfully!');

let _contents, fileId2fileNameMap = {}, currentPath = '/mnt';
window.addEventListener('DOMContentLoaded', () => {
    subscribe('files:list:updated', ({view, folder, contents}) => {
        currentPath = replacePathPrefix(folder.attributes.filename, '/mnt')
        _contents = contents;
        for (let item of contents) {
            fileId2fileNameMap[item.data.id] = item.attributes.filename;
        }
    })
})

registerFileListAction({
    displayName: function () {
        return 'CopySelectedLinks';
    },
    enabled: function () {
        return true;
    },
    exec: function () {
        // 获取所有指定 class 的 checkbox 元素
        const checkboxes = document.querySelectorAll('.checkbox-radio-switch__input[type="checkbox"]');

        // 过滤出已勾选的 checkbox，并提取相关信息
        const selectedItems = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => {
                const tr = checkbox.closest('tr');
                if (!tr) return null;

                // 获取 fileId
                const fileId = tr.getAttribute('data-cy-files-list-row-fileid');

                // 获取兄弟节点中的文件名称
                const checkboxTd = checkbox.closest('td');
                const nameTd = checkboxTd?.nextElementSibling?.classList.contains('files-list__row-name')
                    ? checkboxTd.nextElementSibling
                    : Array.from(tr.querySelectorAll('td')).find(td =>
                        td.classList.contains('files-list__row-name')
                    );

                const nameElement = nameTd?.querySelector('.files-list__row-name-');
                const fileName = nameElement?.textContent.trim() || '';

                return {fileId, fileName};
            })
            .filter(item => item !== null && item.fileId !== null);

        // 获取勾选数量
        const checkedCount = selectedItems.length;
        if (checkedCount === 0) {
            showError('您还未勾选任何文件，请先勾选文件',{"timeout": 1000})
            return
        }

        // 输出结果
        console.log('勾选数量:', checkedCount);
        console.log('勾选项详情:', selectedItems);
        let copyArray = [];
        for (const selectItem of selectedItems) {
            copyArray[copyArray.length] = fileId2fileNameMap[selectItem.fileId] + '\t' + window.location.origin + '/f/' + selectItem.fileId
        }
        copyTextToClipboard(copyArray.join('\n'));
        showSuccess("已成功复制内部分享链接到剪贴板", {"timeout": 1000})
    },
    iconSvgInline: function () {
        return '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1751359290092" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5310" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024"><path d="M749 205.7H293.7l-230.1 230V891c0 37.8 30.7 68.5 68.5 68.5H749c37.8 0 68.5-30.7 68.5-68.5V274.2c0.1-37.8-30.7-68.5-68.5-68.5zM276.1 322v95.7l-95.7-1.1 95.7-94.6zM132.2 891V484.6l177.8 2.1h0.4c9 0 17.7-3.6 24.1-9.9 6.5-6.4 10.2-15.2 10.2-24.4V274.2H749V891H132.2z" fill="#2C2C2C" p-id="5311"></path><path d="M639.4 726.5H235c-18.9 0-34.3 15.3-34.3 34.3 0 18.9 15.3 34.3 34.3 34.3h404.4c18.9 0 34.3-15.3 34.3-34.3-0.1-18.9-15.4-34.3-34.3-34.3zM639.4 418.1H426.9c-18.9 0-34.3 15.3-34.3 34.3 0 18.9 15.3 34.3 34.3 34.3h212.5c18.9 0 34.3-15.3 34.3-34.3-0.1-18.9-15.4-34.3-34.3-34.3zM639.4 575.8H235c-18.9 0-34.3 15.3-34.3 34.3s15.3 34.3 34.3 34.3h404.4c18.9 0 34.3-15.3 34.3-34.3s-15.4-34.3-34.3-34.3zM925.1 63.9H465.9c-18.9 0-34.3 15.3-34.3 34.3s15.3 34.3 34.3 34.3h424.9v562c0 18.9 15.4 34.3 34.3 34.3s34.3-15.3 34.3-34.3V98.1c-0.1-18.9-15.4-34.2-34.3-34.2z" fill="#2C2C2C" p-id="5312"></path></svg>';
    },
    id: 'CopySelectedLinks',
    order: 6
})

registerFileListAction({
    displayName: function () {
        return 'Image_QualityCheck';
    },
    enabled: function () {
        return true;
    },
    exec: async function () {
        try {
                const response = await fetch('/export_image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: currentPath })
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    // 下载文件
                    window.location.href = `/download/${encodeURIComponent(data.file_path)}?filename=${encodeURIComponent(data.file_name)}`;
                    showSuccess("开始下载文件", {"timeout": 1000})
                } else {
                    showError("导出Excel时出错,请联系Luger", {"timeout": 1000})
                }
            } catch (err) {
                console.error(err);
                showError("导出Excel时出错,请联系Luger" + err.message, {"timeout": 1000})
            } finally {
                
            }
        
    },
    iconSvgInline: function () {
        return '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1751359560030" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8850" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024"><path d="M394.6 689.8c-13.2 3.2-27.4-9.5-31.7-23.2-8.4-28.5-12.7-58.6-12.7-88.1 0-159.4 151.5-325.1 314.1-352.1v-5.3c0-1.6 0-3.7 0.5-5.3l0.5-2.1c1.6-11.6 5.8-38.5 32.2-55.4 10.6-6.9 22.2-10 34.3-10 14.8 0 26.9 5.3 34.3 9.5 1.6 0.5 2.6 1.6 4.2 2.6L929.2 286c17.4 13.2 28 34.8 28 57 0 22.7-10.6 44.3-28.5 57.5L770.5 525.7c-11.6 9-25.3 13.7-39.1 13.7-12.1 0-23.8-3.7-34.8-10.6-21.1-13.7-31.7-34.8-31.7-64.4v-1.1C559.3 475 442.2 569 416.3 657.6c-4.8 14.3-13.7 32.2-21.7 32.2z m335.7-466.6V256c0 17.4-13.7 31.7-31.1 32.7-125.6 6.9-257.6 131.4-279.7 254.4C486 458.7 595.2 390 699.7 397.4c17.4 1.1 30.6 15.3 30.6 32.7V465c0 4.7 0.5 6.9 0.5 7.9l157.3-124.6c2.1-1.6 2.6-3.2 2.6-5.3 0-2.1-1.1-4.2-2.6-5.3L731.9 214.3c-1.1 1.6-1.6 5.8-2.1 8.4l0.5 0.5z m0 0" p-id="8851"></path><path d="M715.6 916.3H188.3c-67 0-121.9-54.9-121.9-121.9v-568c0-67 54.9-121.9 121.9-121.9h436.5v69.7H188.3c-28.5 0-52.3 23.2-52.3 52.3V795c0 28.5 23.2 52.3 52.3 52.3h527.3c28.5 0 52.3-23.2 52.3-52.3V593.2H837v201.6c0 66.6-54.4 121.5-121.4 121.5z m0 0" p-id="8852"></path><path d="M183 566.9h112.4V626H183v-59.1z m0 154.1h296.1v59.1H183V721z m0-425.4h237v59.1H183v-59.1z m0 140.9h112.4v59.1H183v-59.1z m0 0" p-id="8853"></path></svg>';
    },
    id: 'Image_QualityCheck',
    order: 5
})

registerFileListAction({
    displayName: function () {
        return 'Audio_QualityCheck';
    },
    enabled: function () {
        return true;
    },
    exec: async function () {
        try {
                const response = await fetch('/export_audio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: currentPath })
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    // 下载文件
                    window.location.href = `/download/${encodeURIComponent(data.file_path)}?filename=${encodeURIComponent(data.file_name)}`;
                    showSuccess("开始下载文件", {"timeout": 1000})
                } else {
                    showError("导出Excel时出错,请联系Luger", {"timeout": 1000})
                }
            } catch (err) {
                console.error(err);
                showError("导出Excel时出错,请联系Luger" + err.message, {"timeout": 1000})
            } finally {
                
            }
        
    },
    iconSvgInline: function () {
        return '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1751359560030" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8850" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024"><path d="M394.6 689.8c-13.2 3.2-27.4-9.5-31.7-23.2-8.4-28.5-12.7-58.6-12.7-88.1 0-159.4 151.5-325.1 314.1-352.1v-5.3c0-1.6 0-3.7 0.5-5.3l0.5-2.1c1.6-11.6 5.8-38.5 32.2-55.4 10.6-6.9 22.2-10 34.3-10 14.8 0 26.9 5.3 34.3 9.5 1.6 0.5 2.6 1.6 4.2 2.6L929.2 286c17.4 13.2 28 34.8 28 57 0 22.7-10.6 44.3-28.5 57.5L770.5 525.7c-11.6 9-25.3 13.7-39.1 13.7-12.1 0-23.8-3.7-34.8-10.6-21.1-13.7-31.7-34.8-31.7-64.4v-1.1C559.3 475 442.2 569 416.3 657.6c-4.8 14.3-13.7 32.2-21.7 32.2z m335.7-466.6V256c0 17.4-13.7 31.7-31.1 32.7-125.6 6.9-257.6 131.4-279.7 254.4C486 458.7 595.2 390 699.7 397.4c17.4 1.1 30.6 15.3 30.6 32.7V465c0 4.7 0.5 6.9 0.5 7.9l157.3-124.6c2.1-1.6 2.6-3.2 2.6-5.3 0-2.1-1.1-4.2-2.6-5.3L731.9 214.3c-1.1 1.6-1.6 5.8-2.1 8.4l0.5 0.5z m0 0" p-id="8851"></path><path d="M715.6 916.3H188.3c-67 0-121.9-54.9-121.9-121.9v-568c0-67 54.9-121.9 121.9-121.9h436.5v69.7H188.3c-28.5 0-52.3 23.2-52.3 52.3V795c0 28.5 23.2 52.3 52.3 52.3h527.3c28.5 0 52.3-23.2 52.3-52.3V593.2H837v201.6c0 66.6-54.4 121.5-121.4 121.5z m0 0" p-id="8852"></path><path d="M183 566.9h112.4V626H183v-59.1z m0 154.1h296.1v59.1H183V721z m0-425.4h237v59.1H183v-59.1z m0 140.9h112.4v59.1H183v-59.1z m0 0" p-id="8853"></path></svg>';
    },
    id: 'Audio_QualityCheck',
    order: 4
})

registerFileListAction({
    displayName: function () {
        return 'Video_QualityCheck';
    },
    enabled: function () {
        return true;
    },
    exec: async function () {
        try {
                const response = await fetch('/export_video', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: currentPath })
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    // 下载文件
                    window.location.href = `/download/${encodeURIComponent(data.file_path)}?filename=${encodeURIComponent(data.file_name)}`;
                    showSuccess("开始下载文件", {"timeout": 1000})
                } else {
                    showError("导出Excel时出错,请联系Luger", {"timeout": 1000})
                }
            } catch (err) {
                console.error(err);
                showError("导出Excel时出错,请联系Luger" + err.message, {"timeout": 1000})
            } finally {
                
            }
        
    },
    iconSvgInline: function () {
        return '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1751359560030" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8850" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024"><path d="M394.6 689.8c-13.2 3.2-27.4-9.5-31.7-23.2-8.4-28.5-12.7-58.6-12.7-88.1 0-159.4 151.5-325.1 314.1-352.1v-5.3c0-1.6 0-3.7 0.5-5.3l0.5-2.1c1.6-11.6 5.8-38.5 32.2-55.4 10.6-6.9 22.2-10 34.3-10 14.8 0 26.9 5.3 34.3 9.5 1.6 0.5 2.6 1.6 4.2 2.6L929.2 286c17.4 13.2 28 34.8 28 57 0 22.7-10.6 44.3-28.5 57.5L770.5 525.7c-11.6 9-25.3 13.7-39.1 13.7-12.1 0-23.8-3.7-34.8-10.6-21.1-13.7-31.7-34.8-31.7-64.4v-1.1C559.3 475 442.2 569 416.3 657.6c-4.8 14.3-13.7 32.2-21.7 32.2z m335.7-466.6V256c0 17.4-13.7 31.7-31.1 32.7-125.6 6.9-257.6 131.4-279.7 254.4C486 458.7 595.2 390 699.7 397.4c17.4 1.1 30.6 15.3 30.6 32.7V465c0 4.7 0.5 6.9 0.5 7.9l157.3-124.6c2.1-1.6 2.6-3.2 2.6-5.3 0-2.1-1.1-4.2-2.6-5.3L731.9 214.3c-1.1 1.6-1.6 5.8-2.1 8.4l0.5 0.5z m0 0" p-id="8851"></path><path d="M715.6 916.3H188.3c-67 0-121.9-54.9-121.9-121.9v-568c0-67 54.9-121.9 121.9-121.9h436.5v69.7H188.3c-28.5 0-52.3 23.2-52.3 52.3V795c0 28.5 23.2 52.3 52.3 52.3h527.3c28.5 0 52.3-23.2 52.3-52.3V593.2H837v201.6c0 66.6-54.4 121.5-121.4 121.5z m0 0" p-id="8852"></path><path d="M183 566.9h112.4V626H183v-59.1z m0 154.1h296.1v59.1H183V721z m0-425.4h237v59.1H183v-59.1z m0 140.9h112.4v59.1H183v-59.1z m0 0" p-id="8853"></path></svg>';
    },
    id: 'Video_QualityCheck',
    order: 3
})

registerFileListAction({
    displayName: function () {
        return 'Filename Robot';
    },
    enabled: function () {
        return true;
    },
    exec: async function () {
        try {
                const response = await fetch('/export', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: currentPath })
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    // 下载文件
                    window.location.href = `/download/${encodeURIComponent(data.file_path)}?filename=${encodeURIComponent(data.file_name)}`;
                    showSuccess("开始下载文件", {"timeout": 1000})
                } else {
                    showError("导出Excel时出错,请联系Luger", {"timeout": 1000})
                }
            } catch (err) {
                console.error(err);
                showError("导出Excel时出错,请联系Luger" + err.message, {"timeout": 1000})
            } finally {
                
            }
        
    },
    iconSvgInline: function () {
        return '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1751359560030" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8850" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024"><path d="M394.6 689.8c-13.2 3.2-27.4-9.5-31.7-23.2-8.4-28.5-12.7-58.6-12.7-88.1 0-159.4 151.5-325.1 314.1-352.1v-5.3c0-1.6 0-3.7 0.5-5.3l0.5-2.1c1.6-11.6 5.8-38.5 32.2-55.4 10.6-6.9 22.2-10 34.3-10 14.8 0 26.9 5.3 34.3 9.5 1.6 0.5 2.6 1.6 4.2 2.6L929.2 286c17.4 13.2 28 34.8 28 57 0 22.7-10.6 44.3-28.5 57.5L770.5 525.7c-11.6 9-25.3 13.7-39.1 13.7-12.1 0-23.8-3.7-34.8-10.6-21.1-13.7-31.7-34.8-31.7-64.4v-1.1C559.3 475 442.2 569 416.3 657.6c-4.8 14.3-13.7 32.2-21.7 32.2z m335.7-466.6V256c0 17.4-13.7 31.7-31.1 32.7-125.6 6.9-257.6 131.4-279.7 254.4C486 458.7 595.2 390 699.7 397.4c17.4 1.1 30.6 15.3 30.6 32.7V465c0 4.7 0.5 6.9 0.5 7.9l157.3-124.6c2.1-1.6 2.6-3.2 2.6-5.3 0-2.1-1.1-4.2-2.6-5.3L731.9 214.3c-1.1 1.6-1.6 5.8-2.1 8.4l0.5 0.5z m0 0" p-id="8851"></path><path d="M715.6 916.3H188.3c-67 0-121.9-54.9-121.9-121.9v-568c0-67 54.9-121.9 121.9-121.9h436.5v69.7H188.3c-28.5 0-52.3 23.2-52.3 52.3V795c0 28.5 23.2 52.3 52.3 52.3h527.3c28.5 0 52.3-23.2 52.3-52.3V593.2H837v201.6c0 66.6-54.4 121.5-121.4 121.5z m0 0" p-id="8852"></path><path d="M183 566.9h112.4V626H183v-59.1z m0 154.1h296.1v59.1H183V721z m0-425.4h237v59.1H183v-59.1z m0 140.9h112.4v59.1H183v-59.1z m0 0" p-id="8853"></path></svg>';
    },
    id: 'FileNameRobot',
    order: 2
})

registerFileListAction({
    displayName: function () {
        return 'CopyAllLinks';
    },
    enabled: function () {
        return true;
    },
    exec: function () {
        let copyArray = [];
        for (let item of _contents) {
            let fileId = item.data.id
            let fileName = item.attributes.filename
            copyArray[copyArray.length] = replacePathPrefix(fileName, '') + '\t' + window.location.origin + '/f/' + fileId
        }
        copyTextToClipboard(copyArray.join('\n'));
        showSuccess("已成功复制内部分享链接到剪贴板", {"timeout": 1000})
    },
    iconSvgInline: function () {
        return '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1751359290092" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5310" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024"><path d="M749 205.7H293.7l-230.1 230V891c0 37.8 30.7 68.5 68.5 68.5H749c37.8 0 68.5-30.7 68.5-68.5V274.2c0.1-37.8-30.7-68.5-68.5-68.5zM276.1 322v95.7l-95.7-1.1 95.7-94.6zM132.2 891V484.6l177.8 2.1h0.4c9 0 17.7-3.6 24.1-9.9 6.5-6.4 10.2-15.2 10.2-24.4V274.2H749V891H132.2z" fill="#2C2C2C" p-id="5311"></path><path d="M639.4 726.5H235c-18.9 0-34.3 15.3-34.3 34.3 0 18.9 15.3 34.3 34.3 34.3h404.4c18.9 0 34.3-15.3 34.3-34.3-0.1-18.9-15.4-34.3-34.3-34.3zM639.4 418.1H426.9c-18.9 0-34.3 15.3-34.3 34.3 0 18.9 15.3 34.3 34.3 34.3h212.5c18.9 0 34.3-15.3 34.3-34.3-0.1-18.9-15.4-34.3-34.3-34.3zM639.4 575.8H235c-18.9 0-34.3 15.3-34.3 34.3s15.3 34.3 34.3 34.3h404.4c18.9 0 34.3-15.3 34.3-34.3s-15.4-34.3-34.3-34.3zM925.1 63.9H465.9c-18.9 0-34.3 15.3-34.3 34.3s15.3 34.3 34.3 34.3h424.9v562c0 18.9 15.4 34.3 34.3 34.3s34.3-15.3 34.3-34.3V98.1c-0.1-18.9-15.4-34.2-34.3-34.2z" fill="#2C2C2C" p-id="5312"></path></svg>';
    },
    id: 'CopyAllLinks',
    order: 1
})

function replacePathPrefix(path, prefix) {
  const parts = path.split('/');
  if (parts.length >= 3) {
    // 替换前两段为 /mnt
    return [prefix, ...parts.slice(3)].join('/');
  }
  // 如果路径不符合预期格式，则原样返回
  return path;
}

async function copyTextToClipboard(text) {
    // console.info(text)
    // 优先使用 Clipboard API
    // if (navigator.clipboard) {
    //     try {
    //         await navigator.clipboard.writeText(text);
    //         console.log('内容已复制到剪贴板');
    //         return true;
    //     } catch (err) {
    //         console.warn('Clipboard API 复制失败，回退到传统方法');
    //     }
    // }

    // 传统方法
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        const result = document.execCommand('copy');
        console.log('内容已复制到剪贴板（传统方法）');
        return result;
    } catch (err) {
        console.error('复制失败:', err);
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

// addNewFileMenuEntry(myEntry)

// // 多选文件监听和顶部按钮功能
// let selectedFiles = [];
// let copyButton = null;
//
// // 创建顶部复制按钮
// function createTopCopyButton() {
//     const button = document.createElement('button');
//     button.className = 'button primary';
//     button.innerHTML = '<span class="icon-copy"></span> 批量复制链接';
//     button.style.cssText = `
//         margin-left: 10px;
//         background: #0082c9;
//         color: white;
//         border: none;
//         padding: 8px 16px;
//         border-radius: 3px;
//         cursor: pointer;
//         display: inline-flex;
//         align-items: center;
//         gap: 5px;
//     `;
//
//     button.onclick = handleBatchCopyLinks;
//     return button;
// }
//
// // 处理批量复制链接
// function handleBatchCopyLinks() {
//     console.log('批量复制链接按钮被点击！');
//     console.log('当前选中的文件数量:', selectedFiles.length);
//     console.log('选中的文件:', selectedFiles);
//
//     // 输出文件详细信息
//     selectedFiles.forEach((file, index) => {
//         console.log(`文件 ${index + 1}:`);
//     });
//
//     // 实际复制链接功能
//     const links = selectedFiles
//         .map(file => file.fileid || file.id)
//         .filter(Boolean)
//         .map(id => `${window.location.origin}/f/${id}`);
//
//     if (links.length > 0) {
//         navigator.clipboard.writeText(links.join('\n')).then(() => {
//             console.log('链接已复制到剪贴板');
//             // 显示成功通知
//             if (window.OC && window.OC.Notification) {
//                 window.OC.Notification.showTemporary(`已复制 ${links.length} 个文件链接`);
//             }
//         }).catch(err => {
//             console.error('复制失败:', err);
//         });
//     }
// }
//
// // 更新按钮显示状态
// function updateButtonVisibility() {
//     console.log('更新按钮状态，当前选中文件数:', selectedFiles.length);
//
//     // 查找文件控制栏的多个可能位置
//     const controlsBar = document.querySelector('.files-controls') ||
//                        document.querySelector('#controls') ||
//                        document.querySelector('.app-files-controls') ||
//                        document.querySelector('[data-cy-files-content-breadcrumbs]')?.parentElement ||
//                        document.querySelector('.files-list__header') ||
//                        document.querySelector('.app-content-list-controls');
//
//     if (!controlsBar) {
//         console.log('未找到控制栏');
//         return;
//     }
//
//     if (selectedFiles.length > 1) {
//         // 显示按钮
//         if (!copyButton) {
//             copyButton = createTopCopyButton();
//             controlsBar.appendChild(copyButton);
//             console.log('批量复制按钮已添加到控制栏');
//         }
//         copyButton.style.display = 'inline-flex';
//     } else {
//         // 隐藏按钮
//         if (copyButton) {
//             copyButton.style.display = 'none';
//             console.log('批量复制按钮已隐藏');
//         }
//     }
// }
//
// // 监听文件选择变化
// function initFileSelection() {
//     console.log('初始化文件选择监听...');
//
//     // 监听 Nextcloud 文件应用的选择变化事件
//     subscribe('files:selection:changed', (event) => {
//         console.log('文件选择变化事件:', event);
//         selectedFiles = event.selection || [];
//         updateButtonVisibility();
//     });
//
//     console.log('文件选择监听已初始化');
// }
//
// // 初始化函数
// function initCopyLinks() {
//     console.log('Initializing CopyLinks functionality...');
//
//     // 初始化文件选择监听
//     initFileSelection();
//
//     console.log('CopyLinks functionality initialized');
// }
//
// // 确保DOM加载完成后初始化
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initCopyLinks);
// } else {
//     initCopyLinks();
// }
//
// // 也在window load事件时初始化
// window.addEventListener('load', () => {
//     console.log('Window loaded - CopyLinks should be active');
//     setTimeout(initCopyLinks, 1000);
// });
//
// console.log('CopyLinks files.js script end');
