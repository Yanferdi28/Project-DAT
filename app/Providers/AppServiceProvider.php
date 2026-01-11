<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Strict model behavior in non-production
        Model::shouldBeStrict(!$this->app->environment('production'));
        
        // Prevent lazy loading in non-production (helps find N+1 issues)
        Model::preventLazyLoading(!$this->app->environment('production'));
        
        // Prevent silently discarding attributes in non-production
        Model::preventSilentlyDiscardingAttributes(!$this->app->environment('production'));

        // Optimize query performance - disable query log in production
        if ($this->app->environment('production')) {
            DB::disableQueryLog();
        }
    }
}
