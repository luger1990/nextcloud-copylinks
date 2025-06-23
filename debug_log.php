<?php
// 简单的调试脚本来检查应用是否加载

// 检查应用是否存在
$appPath = __DIR__;
echo "应用路径: " . $appPath . "\n";

// 检查关键文件是否存在
$files = [
    'appinfo/info.xml',
    'lib/AppInfo/Application.php',
    'js/copylinks-files.js'
];

foreach ($files as $file) {
    $fullPath = $appPath . '/' . $file;
    if (file_exists($fullPath)) {
        echo "✓ " . $file . " 存在\n";
    } else {
        echo "✗ " . $file . " 不存在\n";
    }
}

// 检查JavaScript文件大小
$jsFile = $appPath . '/js/copylinks-files.js';
if (file_exists($jsFile)) {
    $size = filesize($jsFile);
    echo "JavaScript文件大小: " . $size . " 字节\n";
    
    // 显示文件内容的前100个字符
    $content = file_get_contents($jsFile);
    echo "文件内容预览: " . substr($content, 0, 100) . "...\n";
}

echo "\n完成检查。\n";
?> 