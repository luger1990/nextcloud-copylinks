import {showMessage, showInfo, showSuccess, showWarning, showError} from '@nextcloud/dialogs'
import {registerFileListAction} from "@nextcloud/files";
import {subscribe} from "@nextcloud/event-bus";


console.log('CopyLinks app files.js loaded successfully!');

let _contents, fileId2fileNameMap = {};
window.addEventListener('DOMContentLoaded', () => {
    subscribe('files:list:updated', ({view, folder, contents}) => {
        _contents = contents;
        for (let item of contents) {
            fileId2fileNameMap[item.data.id] = item.attributes.filename;
        }
    })
})

registerFileListAction({
    displayName: function () {
        return 'CopyLinks';
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
        return 'aaaaa';
    },
    id: 'copyLinks',
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
            copyArray[copyArray.length] = fileName + '\t' + window.location.origin + '/f/' + fileId
        }
        copyTextToClipboard(copyArray.join('\n'));
        showSuccess("已成功复制内部分享链接到剪贴板", {"timeout": 1000})
    },
    iconSvgInline: function () {
        return 'aaaaa';
    },
    id: 'copyAllLinks',
    order: 1
})

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
