<?php

namespace App\Policies;

use App\Models\ArsipUnit;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ArsipUnitPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ArsipUnit $arsipUnit): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role !== 'operator';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ArsipUnit $arsipUnit): bool
    {
        if ($user->role === 'operator') {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $user->unit_pengolah_id === $arsipUnit->unit_pengolah_arsip_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ArsipUnit $arsipUnit): bool
    {
        return $this->update($user, $arsipUnit);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ArsipUnit $arsipUnit): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ArsipUnit $arsipUnit): bool
    {
        return $user->isAdmin();
    }
}
