<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UnitPengolah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * This project uses custom admin-based verification (not Laravel's default email verification).
     * Users are verified by admin via /users/{user}/verify endpoint.
     * The standard verification.notice and verification.verify routes do not exist.
     */

    public function test_unverified_user_is_redirected_to_verification_pending()
    {
        $unit = UnitPengolah::create(['nama_unit' => 'Test Unit']);
        $user = User::factory()->unverified()->create([
            'role' => 'user',
            'unit_pengolah_id' => $unit->id,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect('/verification/pending');
    }

    public function test_verified_user_can_access_dashboard()
    {
        $unit = UnitPengolah::create(['nama_unit' => 'Test Unit']);
        $user = User::factory()->create([
            'role' => 'admin',
            'unit_pengolah_id' => $unit->id,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
    }

    public function test_verification_pending_page_can_be_rendered()
    {
        $unit = UnitPengolah::create(['nama_unit' => 'Test Unit']);
        $user = User::factory()->unverified()->create([
            'role' => 'user',
            'unit_pengolah_id' => $unit->id,
        ]);

        $response = $this->actingAs($user)->get('/verification/pending');

        $response->assertOk();
    }
}
