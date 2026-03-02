<?php

namespace App\Traits;

use App\Models\ActivityLog;

trait LogsActivity
{
    /**
     * Boot the trait to register model events.
     */
    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            $modelName = static::getActivityModelName();
            $identifier = static::resolveActivityIdentifier($model);

            ActivityLog::log(
                'created',
                "{$modelName} {$identifier} dibuat",
                $model,
                null,
                $model->getAttributes(),
            );
        });

        static::updated(function ($model) {
            $modelName = static::getActivityModelName();
            $identifier = static::resolveActivityIdentifier($model);
            $changes = $model->getChanges();
            $original = collect($model->getOriginal())
                ->only(array_keys($changes))
                ->toArray();

            // Skip if only timestamps changed
            $nonTimestampChanges = collect($changes)->except(['updated_at', 'created_at'])->toArray();
            if (empty($nonTimestampChanges)) {
                return;
            }

            // Filter out sensitive or noisy fields
            $ignoredFields = static::getIgnoredFields();
            $filteredChanges = collect($nonTimestampChanges)->except($ignoredFields)->toArray();
            $filteredOriginal = collect($original)->except([...$ignoredFields, 'updated_at', 'created_at'])->toArray();

            if (empty($filteredChanges)) {
                return;
            }

            ActivityLog::log(
                'updated',
                "{$modelName} {$identifier} diperbarui",
                $model,
                $filteredOriginal,
                $filteredChanges,
            );
        });

        static::deleted(function ($model) {
            $modelName = static::getActivityModelName();
            $identifier = static::resolveActivityIdentifier($model);

            ActivityLog::log(
                'deleted',
                "{$modelName} {$identifier} dihapus",
                $model,
                $model->getAttributes(),
                null,
            );
        });
    }

    /**
     * Get the human-readable model name for logging.
     */
    protected static function getActivityModelName(): string
    {
        return property_exists(static::class, 'activityModelName')
            ? static::$activityModelName
            : class_basename(static::class);
    }

    /**
     * Get a human-readable identifier for the model instance.
     */
    protected static function resolveActivityIdentifier($model): string
    {
        if (method_exists($model, 'getActivityIdentifier')) {
            return $model->getActivityIdentifier();
        }

        return "#{$model->getKey()}";
    }

    /**
     * Get fields to ignore when logging changes.
     */
    protected static function getIgnoredFields(): array
    {
        return property_exists(static::class, 'activityIgnoredFields')
            ? static::$activityIgnoredFields
            : [];
    }
}
