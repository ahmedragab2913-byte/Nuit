<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 🔒 تم إيقاف الـ statefulApi تماماً لضمان تفعيل الـ API Tokens بنجاح
        //$middleware->statefulApi();

        // 🛡️ الحفاظ على حماية لوحة تحكم الأدمن بالكامل
        $middleware->alias([
            'is_admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        // 🧹 تنظيف التوكنز المنتهية يومياً للحفاظ على أداء قاعدة البيانات
        $schedule->command('sanctum:prune-expired --hours=8')->daily();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
