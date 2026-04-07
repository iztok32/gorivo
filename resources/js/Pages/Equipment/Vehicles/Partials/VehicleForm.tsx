import { useForm, router } from '@inertiajs/react'
import { useTranslation } from '@/lib/i18n'
import { Vehicle } from '@/types'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Switch } from '@/Components/ui/switch'

interface VehicleFormProps {
    vehicle?: Vehicle | null
    onSuccess?: () => void
}

export default function VehicleForm({ vehicle, onSuccess }: VehicleFormProps) {
    const { t } = useTranslation()

    const { data, setData, errors, processing, reset } = useForm({
        name:                vehicle?.name ?? '',
        registration_number: vehicle?.registration_number ?? '',
        is_active:           vehicle?.is_active ?? true,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (vehicle) {
            router.put(route('vehicles.update', vehicle.id), data, {
                onSuccess: () => { reset(); onSuccess?.() },
            })
        } else {
            router.post(route('vehicles.store'), data, {
                onSuccess: () => { reset(); onSuccess?.() },
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div className="space-y-1.5">
                <Label htmlFor="name">{t('Name')} <span className="text-destructive">*</span></Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder={t('Vehicle name')}
                    autoFocus
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Registration number */}
            <div className="space-y-1.5">
                <Label htmlFor="registration_number">{t('Registration number')} <span className="text-destructive">*</span></Label>
                <Input
                    id="registration_number"
                    value={data.registration_number}
                    onChange={e => setData('registration_number', e.target.value)}
                    placeholder="npr. LJ AB-123"
                />
                {errors.registration_number && <p className="text-sm text-destructive">{errors.registration_number}</p>}
            </div>

            {/* Is active */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{t('Active')}</Label>
                    <p className="text-xs text-muted-foreground">
                        {data.is_active ? t('Vehicle is active') : t('Vehicle is inactive')}
                    </p>
                </div>
                <Switch
                    checked={data.is_active}
                    onCheckedChange={v => setData('is_active', v)}
                />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="submit" disabled={processing} className="min-w-28">
                    {processing
                        ? t('Saving...')
                        : vehicle
                            ? t('Update Vehicle')
                            : t('Add Vehicle')}
                </Button>
            </div>
        </form>
    )
}
