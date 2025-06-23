<?php

declare(strict_types=1);

namespace OCA\CopyLinks\AppInfo;

use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use Psr\Log\LoggerInterface;

class Application extends App implements IBootstrap {
    public const APP_ID = 'copylinks';

    public function __construct() {
        parent::__construct(self::APP_ID);
    }

    public function register(IRegistrationContext $context): void {
        // 注册应用相关的服务和监听器
        error_log('[CopyLinks] Application registered');
    }

    public function boot(IBootContext $context): void {
        error_log('[CopyLinks] Application boot started');
        
        // 应用启动时的初始化逻辑
        $context->injectFn(function() {
            error_log('[CopyLinks] Injecting scripts and styles');
            
            // 在所有页面都加载脚本，让JavaScript自己判断是否在文件页面
            \OCP\Util::addScript('copylinks', 'copylinks-files');
            \OCP\Util::addStyle('copylinks', 'copylinks');
            
            error_log('[CopyLinks] Scripts and styles injected');
        });
    }
}
