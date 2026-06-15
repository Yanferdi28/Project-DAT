<?php

namespace Database\Seeders;

use App\Models\UnitPengolah;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedUser('admin@example.com', 'Administrator', 'admin', 'TATA USAHA UMUM');
        $this->seedUser('operator@example.com', 'Operator', 'operator', 'KMB');
        $this->seedUser('user@example.com', 'Regular User', 'user', 'SIARAN');
    }

    private function seedUser(string $email, string $name, string $role, string $unitName): void
    {
        $user = User::firstOrNew(['email' => $email]);

        $user->fill([
            'name' => $name,
            'role' => $role,
            'unit_pengolah_id' => $this->unitId($unitName),
            'email_verified_at' => $user->email_verified_at ?? now(),
        ]);

        if (!$user->exists || !$user->password) {
            $user->password = Hash::make('password');
        }

        $user->save();
    }

    private function unitId(string $unitName): ?int
    {
        return UnitPengolah::where('nama_unit', $unitName)->value('id')
            ?? UnitPengolah::query()->value('id');
    }
}
