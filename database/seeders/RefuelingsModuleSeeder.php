<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RefuelingsModuleSeeder extends Seeder
{
    public function run(): void
    {
        // Insert module
        DB::table('modules')->insertOrIgnore([
            'id'          => 15,
            'name'        => 'refuelings',
            'web_root'    => '/equipment/refuelings',
            'description' => 'Evidenca točenja goriva - beleženje količine, stroškov in stanja števca',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Insert permissions
        $permissions = [
            ['id' => 62, 'name' => 'View Refuelings',      'slug' => 'refuelings.view',      'module' => 'refuelings', 'is_active' => true],
            ['id' => 63, 'name' => 'Create Refuelings',    'slug' => 'refuelings.create',    'module' => 'refuelings', 'is_active' => true],
            ['id' => 64, 'name' => 'Edit Refuelings',      'slug' => 'refuelings.edit',      'module' => 'refuelings', 'is_active' => true],
            ['id' => 65, 'name' => 'Delete Refuelings',    'slug' => 'refuelings.delete',    'module' => 'refuelings', 'is_active' => true],
            ['id' => 66, 'name' => 'Is global Refuelings', 'slug' => 'refuelings.is_global', 'module' => 'refuelings', 'is_active' => true],
        ];

        foreach ($permissions as $p) {
            DB::table('permissions')->insertOrIgnore(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // SuperAdmin (1) gets all, Admin (2) gets view/create/edit/delete
        $superAdminIds = [62, 63, 64, 65, 66];
        $adminIds      = [62, 63, 64, 65];

        foreach ($superAdminIds as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 1, 'permission_id' => $pid]);
        }
        foreach ($adminIds as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 2, 'permission_id' => $pid]);
        }

        // Update PostgreSQL sequences
        $maxPerm = DB::table('permissions')->max('id');
        DB::statement("SELECT setval('permissions_id_seq', COALESCE($maxPerm, 1), true)");

        $maxMod = DB::table('modules')->max('id');
        DB::statement("SELECT setval('modules_id_seq', COALESCE($maxMod, 1), true)");

        $this->command->info('Refuelings module seeded successfully!');
    }
}
