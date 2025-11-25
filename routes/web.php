<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile routes (accessible by all authenticated users)
    Route::get('my-profile', [ProfileController::class, 'edit'])->name('myprofile.edit');
    Route::post('my-profile', [ProfileController::class, 'update'])->name('myprofile.update');
    Route::delete('my-profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('myprofile.avatar.delete');

    // Users CRUD routes (admin only)
    Route::middleware('admin')->group(function () {
        Route::resource('users', UserController::class);
        Route::post('users/{user}/verify', [UserController::class, 'verify'])->name('users.verify');
        Route::post('users/{user}/unverify', [UserController::class, 'unverify'])->name('users.unverify');
    });
});

require __DIR__.'/settings.php';
