<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request): Response
    {
        $query = ActivityLog::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by action
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by model type
        if ($request->filled('model_type')) {
            $modelClass = match ($request->model_type) {
                'ArsipUnit' => 'App\\Models\\ArsipUnit',
                'BerkasArsip' => 'App\\Models\\BerkasArsip',
                'User' => 'App\\Models\\User',
                default => $request->model_type,
            };
            $query->where('model_type', $modelClass);
        }

        // Search by description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('description', 'like', "%{$search}%");
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->paginate(20)->withQueryString();

        // Get users for filter dropdown
        $users = User::select('id', 'name')->orderBy('name')->get();

        // Get distinct actions for filter
        $actions = ActivityLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return Inertia::render('activity-log/index', [
            'logs' => $logs,
            'users' => $users,
            'actions' => $actions,
            'filters' => $request->only(['action', 'user_id', 'model_type', 'search', 'from_date', 'to_date']),
        ]);
    }
}
