<?php

use App\Models\User;
use App\Models\UnitPengolah;
use App\Notifications\AccountVerified;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->unitPengolah = UnitPengolah::create(['nama_unit' => 'Unit Test']);
});

// ─── INDEX ────────────────────────────────────────────────

test('guests cannot access user management', function () {
    $this->get('/users')->assertRedirect('/login');
});

test('admin can view user list', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('users/index'));
});

test('operator cannot access user management', function () {
    $operator = createOperator();

    $this->actingAs($operator)
        ->get('/users')
        ->assertForbidden();
});

test('regular user cannot access user management', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get('/users')
        ->assertForbidden();
});

test('user list supports search filter', function () {
    $admin = createAdmin();
    createUser(['name' => 'Budi Santoso', 'email' => 'budi@test.com']);
    createUser(['name' => 'Andi Wijaya', 'email' => 'andi@test.com']);

    $this->actingAs($admin)
        ->get('/users?search=Budi')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('users.data', 1));
});

// ─── CREATE ───────────────────────────────────────────────

test('admin can access user create form', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/users/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('users/create'));
});

// ─── STORE ────────────────────────────────────────────────

test('admin can create a new user', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post('/users', [
            'name' => 'New User Test',
            'email' => 'newuser@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'user',
            'unit_pengolah_id' => $this->unitPengolah->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'name' => 'New User Test',
        'email' => 'newuser@test.com',
        'role' => 'user',
    ]);
});

test('store user requires validation', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post('/users', [])
        ->assertSessionHasErrors(['name', 'email', 'password', 'role']);
});

test('store user rejects duplicate email', function () {
    $admin = createAdmin();
    createUser(['email' => 'existing@test.com']);

    $this->actingAs($admin)
        ->post('/users', [
            'name' => 'Duplicate',
            'email' => 'existing@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'user',
        ])
        ->assertSessionHasErrors(['email']);
});

test('store user validates role enum', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post('/users', [
            'name' => 'Bad Role',
            'email' => 'badrole@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'superadmin',
        ])
        ->assertSessionHasErrors(['role']);
});

// ─── UPDATE ───────────────────────────────────────────────

test('admin can update user', function () {
    $admin = createAdmin();
    $user = createUser(['name' => 'Original Name']);

    $this->actingAs($admin)
        ->put("/users/{$user->id}", [
            'name' => 'Updated Name',
            'email' => $user->email,
            'role' => 'operator',
            'unit_pengolah_id' => $this->unitPengolah->id,
        ])
        ->assertRedirect();

    $user->refresh();
    expect($user->name)->toBe('Updated Name');
    expect($user->role)->toBe('operator');
});

test('admin can update user without changing password', function () {
    $admin = createAdmin();
    $user = createUser();
    $originalPassword = $user->password;

    $this->actingAs($admin)
        ->put("/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ])
        ->assertRedirect();

    $user->refresh();
    expect($user->password)->toBe($originalPassword);
});

// ─── DELETE ───────────────────────────────────────────────

test('admin can delete other user', function () {
    $admin = createAdmin();
    $user = createUser(['name' => 'To Delete']);

    $this->actingAs($admin)
        ->delete("/users/{$user->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('admin cannot delete self', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->delete("/users/{$admin->id}")
        ->assertRedirect();

    // Should still exist
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

// ─── VERIFY / UNVERIFY ───────────────────────────────────

test('admin can verify user', function () {
    Notification::fake();

    $admin = createAdmin();
    $unverified = User::factory()->withoutTwoFactor()->unverified()->create([
        'role' => 'user',
    ]);

    expect($unverified->email_verified_at)->toBeNull();

    $this->actingAs($admin)
        ->post("/users/{$unverified->id}/verify")
        ->assertRedirect();

    $unverified->refresh();
    expect($unverified->email_verified_at)->not->toBeNull();

    Notification::assertSentTo($unverified, AccountVerified::class);
});

test('admin can unverify user', function () {
    $admin = createAdmin();
    $verified = createUser();

    expect($verified->email_verified_at)->not->toBeNull();

    $this->actingAs($admin)
        ->post("/users/{$verified->id}/unverify")
        ->assertRedirect();

    $verified->refresh();
    expect($verified->email_verified_at)->toBeNull();
});
