import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps, Refueling, VehicleOption } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/Components/ui/card'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/Components/ui/sheet'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/table'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/Components/ui/dropdown-menu'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select'
import {
    Plus, Search, Pencil, Trash2, MoreHorizontal,
    Fuel, Filter,
} from 'lucide-react'
import RefuelingForm from './Partials/RefuelingForm'
import { cn } from '@/lib/utils'

interface Props extends PageProps {
    refuelings: Refueling[]
    vehicles: VehicleOption[]
}

function RefuelingActions({
    refueling, canEdit, canDelete, onEdit, onDelete,
}: {
    refueling: Refueling
    canEdit: boolean
    canDelete: boolean
    onEdit: (r: Refueling) => void
    onDelete: (r: Refueling) => void
}) {
    const { t } = useTranslation()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {canEdit && (
                    <DropdownMenuItem onClick={() => onEdit(refueling)}>
                        <Pencil className="size-4 mr-2" />{t('Edit')}
                    </DropdownMenuItem>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(refueling)}
                    >
                        <Trash2 className="size-4 mr-2" />{t('Delete')}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function RefuelingsIndex({ refuelings, vehicles }: Props) {
    const { t } = useTranslation()
    const { auth } = usePage<Props>().props
    const userPermissions = auth.user.permissions ?? []

    const canCreate = userPermissions.includes('refuelings.create')
    const canEdit   = userPermissions.includes('refuelings.edit')
    const canDelete = userPermissions.includes('refuelings.delete')

    const [search, setSearch]                       = useState('')
    const [vehicleFilter, setVehicleFilter]         = useState<string>('all')
    const [isSheetOpen, setIsSheetOpen]             = useState(false)
    const [editingRefueling, setEditingRefueling]   = useState<Refueling | null>(null)
    const [deletingRefueling, setDeletingRefueling] = useState<Refueling | null>(null)

    const filtered = refuelings.filter(r => {
        const matchesSearch =
            r.vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
            r.vehicle.registration_number.toLowerCase().includes(search.toLowerCase())
        const matchesVehicle = vehicleFilter === 'all' || String(r.vehicle_id) === vehicleFilter
        return matchesSearch && matchesVehicle
    })

    const openCreate = () => { setEditingRefueling(null); setIsSheetOpen(true) }
    const openEdit   = (r: Refueling) => { setEditingRefueling(r); setIsSheetOpen(true) }

    const confirmDelete = () => {
        if (!deletingRefueling) return
        router.delete(route('refuelings.destroy', deletingRefueling.id), {
            onSuccess: () => setDeletingRefueling(null),
        })
    }

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const formatNumber = (value: number, decimals = 2) =>
        value.toLocaleString('sl-SI', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

    // Summary totals for filtered rows
    const totalLiters = filtered.reduce((sum, r) => sum + r.fuel_quantity, 0)
    const totalCost   = filtered.reduce((sum, r) => sum + r.fuel_cost, 0)
    const avgPrice    = totalLiters > 0 ? totalCost / totalLiters : 0

    const isEmpty = filtered.length === 0
    const hasActiveFilter = search || vehicleFilter !== 'all'

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl leading-tight">{t('Refueling')}</h2>}>
            <Head title={t('Refueling')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

                    {/* Summary cards */}
                    {!isEmpty && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-4 pb-4">
                                    <p className="text-xs text-muted-foreground">{t('Total fuel')}</p>
                                    <p className="text-2xl font-bold">{formatNumber(totalLiters)} L</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 pb-4">
                                    <p className="text-xs text-muted-foreground">{t('Total cost')}</p>
                                    <p className="text-2xl font-bold">{formatNumber(totalCost)} €</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 pb-4">
                                    <p className="text-xs text-muted-foreground">{t('Average price per liter')}</p>
                                    <p className="text-2xl font-bold">{formatNumber(avgPrice, 3)} €/L</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Card>
                        {/* Header */}
                        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                            <CardTitle className="text-lg">{t('Refueling records')}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t('Search...')}
                                        className="pl-8 w-40"
                                    />
                                </div>

                                {/* Vehicle filter */}
                                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                                    <SelectTrigger className="w-48 gap-1.5">
                                        <Filter className="size-3.5 text-muted-foreground shrink-0" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All vehicles')}</SelectItem>
                                        {vehicles.map(v => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                {v.name} <span className="font-mono text-xs">({v.registration_number})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Add button */}
                                {canCreate && (
                                    <Button onClick={openCreate} size="sm">
                                        <Plus className="size-4 mr-1" />
                                        {t('Add refueling')}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('Vehicle')}</TableHead>
                                        <TableHead>{t('Date')}</TableHead>
                                        <TableHead className="text-right">{t('Quantity')} (L)</TableHead>
                                        <TableHead className="text-right">{t('Cost')} (€)</TableHead>
                                        <TableHead className="text-right">{t('€/L')}</TableHead>
                                        <TableHead className="text-right">{t('Odometer')} (km)</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isEmpty ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                                <Fuel className="size-8 mx-auto mb-2 opacity-30" />
                                                {hasActiveFilter ? t('No records match your search.') : t('No refueling records yet.')}
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map(refueling => (
                                        <TableRow key={refueling.id} className={cn(refueling.deleted_at && 'opacity-50')}>
                                            <TableCell>
                                                <div className="font-medium">{refueling.vehicle.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{refueling.vehicle.registration_number}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">{formatDate(refueling.refueling_date)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatNumber(refueling.fuel_quantity)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatNumber(refueling.fuel_cost)}</TableCell>
                                            <TableCell className="text-right tabular-nums text-muted-foreground text-sm">
                                                {formatNumber(refueling.fuel_quantity > 0 ? refueling.fuel_cost / refueling.fuel_quantity : 0, 3)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{formatNumber(refueling.odometer_reading, 1)}</TableCell>
                                            <TableCell>
                                                <RefuelingActions
                                                    refueling={refueling}
                                                    canEdit={canEdit}
                                                    canDelete={canDelete}
                                                    onEdit={openEdit}
                                                    onDelete={setDeletingRefueling}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create / Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingRefueling ? t('Edit refueling') : t('Add refueling')}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                        <RefuelingForm
                            refueling={editingRefueling}
                            vehicles={vehicles}
                            onSuccess={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete confirmation */}
            <AlertDialog open={!!deletingRefueling} onOpenChange={open => !open && setDeletingRefueling(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Delete refueling record')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('Are you sure you want to delete this refueling record for')} <strong>{deletingRefueling?.vehicle.name}</strong>?
                            {' '}{t('This action cannot be undone.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            {t('Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    )
}
