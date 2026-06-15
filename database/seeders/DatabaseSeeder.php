<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UnitPengolahSeeder::class,
            UserSeeder::class,
            KodeKlasifikasiSeeder::class,
            KategoriSeeder::class,
            BerkasArsipSeeder::class,
            ArsipUnitSeeder::class,
        ]);
    }
}
