<template>
    <div id="copylinks-app">
        <h2>{{ t('copylinks', '复制链接工具') }}</h2>
        <p>{{ t('copylinks', '在文件应用中选择多个文件后，将在顶部显示复制链接按钮。') }}</p>
    </div>
</template>

<script>
export default {
    name: 'CopyLinksApp',
}
</script>

<style scoped>
#copylinks-app {
    padding: 20px;
}

h2 {
    margin-bottom: 20px;
}

p {
    color: var(--color-text-light);
}
</style> 