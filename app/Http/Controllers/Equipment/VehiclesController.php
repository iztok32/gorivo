<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use App\Models\Equipment\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VehiclesController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::orderByDesc('created_at')
            ->get()
            ->map(fn (Vehicle $v) => $this->formatVehicle($v));

        return Inertia::render('Equipment/Vehicles/Index', [
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'registration_number' => 'required|string|max:50|unique:vehicles,registration_number',
            'is_active'           => 'boolean',
        ]);

        Vehicle::create($validated);

        return redirect()->back()->with('success', 'Vozilo je bilo uspešno dodano.');
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'registration_number' => ['required', 'string', 'max:50', Rule::unique('vehicles', 'registration_number')->ignore($vehicle->id)],
            'is_active'           => 'boolean',
        ]);

        $vehicle->update($validated);

        return redirect()->back()->with('success', 'Vozilo je bilo uspešno posodobljeno.');
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return redirect()->back()->with('success', 'Vozilo je bilo uspešno izbrisano.');
    }

    private function formatVehicle(Vehicle $vehicle): array
    {
        return [
            'id'                  => $vehicle->id,
            'name'                => $vehicle->name,
            'registration_number' => $vehicle->registration_number,
            'is_active'           => $vehicle->is_active,
            'created_at'          => $vehicle->created_at?->toISOString(),
            'updated_at'          => $vehicle->updated_at?->toISOString(),
            'deleted_at'          => $vehicle->deleted_at?->toISOString(),
        ];
    }
}
