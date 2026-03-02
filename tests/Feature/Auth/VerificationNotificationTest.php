<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UnitPengolah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * This project uses custom admin-based verification.
 * The standard verification.send route does not exist.
 * Testing the custom verification flow instead.
 */
class VerificationNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_user_sees_pending_page(): void
    {
        $unit = UnitPengolah::create(['nama_unit' => 'Test Unit']);
        $user = User::factory()->unverified()->create([
            'role' => 'user',
            'unit_pengolah_id' => $unit->id,
        ]);

        $this->actingAs($user)
            ->get('/verification/pending')
            ->assertOk();
    }

    public function test_verified_user_is_redirected_from_pending_page(): void
    {
        $unit = UnitPengolah::create(['nama_unit' => 'Test Unit']);
        $user = User::factory()->create([
            'role' => 'admin',
            'unit_pengolah_id' => $unit->id,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/verification/pending')
            ->assertRedirect('/dashboard');
    }
}
