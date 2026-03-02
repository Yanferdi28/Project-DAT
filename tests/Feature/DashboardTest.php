<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $unit = \App\Models\UnitPengolah::create(['nama_unit' => 'Test Unit']);
        $user = User::factory()->create([
            'role' => 'admin',
            'unit_pengolah_id' => $unit->id,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user);

        $this->get(route('dashboard'))->assertOk();
    }
}
