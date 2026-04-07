import { useForm, router } from '@inertiajs/react'
import { useTranslation } from '@/lib/i18n'
import { Refueling, VehicleOption } from '@/types'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { DatePicker } from '@/Components/ui/date-picker'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select'

interface RefuelingFormProps {
    refueling?: Refueling | null
    vehicles: VehicleOption[]
    onSuccess?: () => void
}

export default function RefuelingForm({ refueling, vehicles, onSuccess }: RefuelingFormProps) {
    const { t } = useTranslation()

    const { data, setData, errors, processing, reset } = useForm({
        vehicle_id:       refueling?.vehicle_id ? String(refueling.vehicle_id) : '',
        fuel_quantity:    refueling?.fuel_quantity ? String(refueling.fuel_quantity) : '',
        fuel_cost:        refueling?.fuel_cost ? String(refueling.fuel_cost) : '',
        refueling_date:   refueling?.refueling_date ?? '',
        odometer_reading: refueling?.odometer_reading ? String(refueling.odometer_reading) : '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            vehicle_id:       Number(data.vehicle_id),
            fuel_quantity:    data.fuel_quantity,
            fuel_cost:        data.fuel_cost,
            refueling_date:   data.refueling_date,
            odometer_reading: data.odometer_reading,
        }

        if (refueling) {
            router.put(route('refuelings.update', refueling.id), payload, {
                onSuccess: () => { reset(); onSuccess?.() },
            })
        } else {
            router.post(route('refuelings.store'), payload, {
                onSuccess: () => { reset(); onSuccess?.() },
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Vehicle */}
            <div className="space-y-1.5">
                <Label htmlFor="vehicle_id">{t('Vehicle')} <span className="text-destructive">*</span></Label>
                <Select value={data.vehicle_id} onValueChange={v => setData('vehicle_id', v)}>
                    <SelectTrigger id="vehicle_id" className="w-full">
                        <SelectValue placeholder={t('Select vehicle')} />
                    </SelectTrigger>
                    <SelectContent>
                        {vehicles.map(v => (
                            <SelectItem key={v.id} value={String(v.id)}>
                                {v.name}
                                <span className="ml-1.5 text-xs text-muted-foreground font-mono">({v.registration_number})</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.vehicle_id && <p className="text-sm text-destructive">{errors.vehicle_id}</p>}
            </div>

            {/* Refueling date */}
            <div className="space-y-1.5">
                <Label>{t('Refueling date')} <span className="text-destructive">*</span></Label>
                <DatePicker
                    value={data.refueling_date}
                    onChange={v => setData('refueling_date', v)}
                    placeholder={t('Select date')}
                />
                {errors.refueling_date && <p className="text-sm text-destructive">{errors.refueling_date}</p>}
            </div>

            {/* Fuel quantity + cost row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="fuel_quantity">{t('Fuel quantity')} (L) <span className="text-destructive">*</span></Label>
                    <Input
                        id="fuel_quantity"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={data.fuel_quantity}
                        onChange={e => setData('fuel_quantity', e.target.value)}
                        placeholder="0.00"
                    />
                    {errors.fuel_quantity && <p className="text-sm text-destructive">{errors.fuel_quantity}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="fuel_cost">{t('Fuel cost')} (€) <span className="text-destructive">*</span></Label>
                    <Input
                        id="fuel_cost"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={data.fuel_cost}
                        onChange={e => setData('fuel_cost', e.target.value)}
                        placeholder="0.00"
                    />
                    {errors.fuel_cost && <p className="text-sm text-destructive">{errors.fuel_cost}</p>}
                </div>
            </div>

            {/* Odometer */}
            <div className="space-y-1.5">
                <Label htmlFor="odometer_reading">{t('Odometer reading')} (km) <span className="text-destructive">*</span></Label>
                <Input
                    id="odometer_reading"
                    type="number"
                    step="0.1"
                    min="0"
                    value={data.odometer_reading}
                    onChange={e => setData('odometer_reading', e.target.value)}
                    placeholder="0"
                />
                {errors.odometer_reading && <p className="text-sm text-destructive">{errors.odometer_reading}</p>}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="submit" disabled={processing} className="min-w-28">
                    {processing
                        ? t('Saving...')
                        : refueling
                            ? t('Update')
                            : t('Add refueling')}
                </Button>
            </div>
        </form>
    )
}
