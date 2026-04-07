<?php

namespace App\Models\Equipment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Refueling extends Model implements AuditableContract
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'vehicle_id',
        'fuel_quantity',
        'fuel_cost',
        'refueling_date',
        'odometer_reading',
    ];

    protected function casts(): array
    {
        return [
            'fuel_quantity'    => 'decimal:2',
            'fuel_cost'        => 'decimal:2',
            'odometer_reading' => 'decimal:1',
            'refueling_date'   => 'date',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
