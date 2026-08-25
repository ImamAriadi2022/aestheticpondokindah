<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if (file_exists(app_path('Services/Shared/Media/ImageOptimizationService.php'))) {
            require_once app_path('Services/Shared/Media/ImageOptimizationService.php');
        }

        $this->app->singleton(
            \App\Contracts\PaymentServiceInterface::class,
            \App\Services\Patient\Payment\SimulationPaymentService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (!class_exists('App\Models\User', false)) {
            class_alias(\App\Models\Shared\User\User::class, 'App\Models\User');
        }

        \Illuminate\Database\Eloquent\Relations\Relation::morphMap([
            'App\Models\User' => \App\Models\Shared\User\User::class,
            'App\Models\Shared\User\User' => \App\Models\Shared\User\User::class,
            'user' => \App\Models\Shared\User\User::class,
        ]);

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\PaymentSettled::class,
            \App\Listeners\ProcessMembershipActivation::class
        );
    }
}
