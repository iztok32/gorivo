<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use App\Models\Equipment\Refueling;
use App\Models\Equipment\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RefuelingsController extends Controller
{
    public function index()
    {
        $refuelings = Refueling::with('vehicle')
            ->orderByDesc('refueling_date')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Refueling $r) => $this->formatRefueling($r));

        $vehicles = Vehicle::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'registration_number']);

        return Inertia::render('Equipment/Refuelings/Index', [
            'refuelings' => $refuelings,
            'vehicles'   => $vehicles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id'       => 'required|exists:vehicles,id',
            'fuel_quantity'    => 'required|numeric|min:0.01|max:9999.99',
            'fuel_cost'        => 'required|numeric|min:0.01|max:99999.99',
            'refueling_date'   => 'required|date',
            'odometer_reading' => 'required|numeric|min:0|max:9999999.9',
        ]);

        Refueling::create($validated);

        return redirect()->back()->with('success', 'Točenje goriva je bilo uspešno dodano.');
    }

    public function update(Request $request, Refueling $refueling)
    {
        $validated = $request->validate([
            'vehicle_id'       => 'required|exists:vehicles,id',
            'fuel_quantity'    => 'required|numeric|min:0.01|max:9999.99',
            'fuel_cost'        => 'required|numeric|min:0.01|max:99999.99',
            'refueling_date'   => 'required|date',
            'odometer_reading' => 'required|numeric|min:0|max:9999999.9',
        ]);

        $refueling->update($validated);

        return redirect()->back()->with('success', 'Točenje goriva je bilo uspešno posodobljeno.');
    }

    public function destroy(Refueling $refueling)
    {
        $refueling->delete();

        return redirect()->back()->with('success', 'Točenje goriva je bilo uspešno izbrisano.');
    }

    private function formatRefueling(Refueling $refueling): array
    {
        return [
            'id'               => $refueling->id,
            'vehicle_id'       => $refueling->vehicle_id,
            'fuel_quantity'    => (float) $refueling->fuel_quantity,
            'fuel_cost'        => (float) $refueling->fuel_cost,
            'refueling_date'   => $refueling->refueling_date?->toDateString(),
            'odometer_reading' => (float) $refueling->odometer_reading,
            'created_at'       => $refueling->created_at?->toISOString(),
            'updated_at'       => $refueling->updated_at?->toISOString(),
            'deleted_at'       => $refueling->deleted_at?->toISOString(),
            'vehicle'          => [
                'id'                  => $refueling->vehicle?->id,
                'name'                => $refueling->vehicle?->name,
                'registration_number' => $refueling->vehicle?->registration_number,
            ],
        ];
    }
}
