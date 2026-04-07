import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps, Vehicle } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Badge } from '@/Components/ui/badge'
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
    Car, LayoutList, LayoutGrid, Filter,
} from 'lucide-react'
import VehicleForm from './Partials/VehicleForm'
import { cn } from '@/lib/utils'

interface Props extends PageProps {
    vehicles: Vehicle[]
}

type ViewMode = 'table' | 'card'
type ActiveFilter = 'all' | 'active' | 'inactive'

function ActiveBadge({ isActive }: { isActive: boolean }) {
    const { t } = useTranslation()
    return isActive
        ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-normal">{t('Active')}</Badge>
        : <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-normal">{t('Inactive')}</Badge>
}

function VehicleActions({
    vehicle, canEdit, canDelete, onEdit, onDelete,
}: {
    vehicle: Vehicle
    canEdit: boolean
    canDelete: boolean
    onEdit: (v: Vehicle) => void
    onDelete: (v: Vehicle) => void
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
                    <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                        <Pencil className="size-4 mr-2" />{t('Edit')}
                    </DropdownMenuItem>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(vehicle)}
                    >
                        <Trash2 className="size-4 mr-2" />{t('Delete')}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function VehiclesIndex({ vehicles }: Props) {
    const { t } = useTranslation()
    const { auth } = usePage<Props>().props
    const userPermissions = auth.user.permissions ?? []

    const canCreate = userPermissions.includes('vehicles.create')
    const canEdit   = userPermissions.includes('vehicles.edit')
    const canDelete = userPermissions.includes('vehicles.delete')

    const [search, setSearch]               = useState('')
    const [viewMode, setViewMode]           = useState<ViewMode>('table')
    const [activeFilter, setActiveFilter]   = useState<ActiveFilter>('all')
    const [isSheetOpen, setIsSheetOpen]     = useState(false)
    const [editingVehicle, setEditingVehicle]   = useState<Vehicle | null>(null)
    const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)

    const filtered = vehicles.filter(v => {
        const matchesSearch =
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.registration_number.toLowerCase().includes(search.toLowerCase())
        const matchesActive =
            activeFilter === 'all' ||
            (activeFilter === 'active' && v.is_active) ||
            (activeFilter === 'inactive' && !v.is_active)
        return matchesSearch && matchesActive
    })

    const openCreate = () => { setEditingVehicle(null); setIsSheetOpen(true) }
    const openEdit   = (v: Vehicle) => { setEditingVehicle(v); setIsSheetOpen(true) }

    const confirmDelete = () => {
        if (!deletingVehicle) return
        router.delete(route('vehicles.destroy', deletingVehicle.id), {
            onSuccess: () => setDeletingVehicle(null),
        })
    }

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const isEmpty = filtered.length === 0
    const hasActiveFilter = search || activeFilter !== 'all'

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl leading-tight">{t('Vehicles')}</h2>}>
            <Head title={t('Vehicles')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        {/* Header */}
                        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                            <CardTitle className="text-lg">{t('Vehicles management')}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t('Search vehicles...')}
                                        className="pl-8 w-44"
                                    />
                                </div>

                                {/* Active filter */}
                                <Select value={activeFilter} onValueChange={v => setActiveFilter(v as ActiveFilter)}>
                                    <SelectTrigger className="w-36 gap-1.5">
                                        <Filter className="size-3.5 text-muted-foreground shrink-0" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All')}</SelectItem>
                                        <SelectItem value="active">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-green-500 inline-block" />
                                                {t('Active')}
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-gray-400 inline-block" />
                                                {t('Inactive')}
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* View toggle */}
                                <div className="flex items-center border rounded-md overflow-hidden">
                                    <Button
                                        variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="size-9 rounded-none border-0"
                                        onClick={() => setViewMode('table')}
                                        title={t('Table view')}
                                    >
                                        <LayoutList className="size-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="size-9 rounded-none border-0"
                                        onClick={() => setViewMode('card')}
                                        title={t('Card view')}
                                    >
                                        <LayoutGrid className="size-4" />
                                    </Button>
                                </div>

                                {/* Add button */}
                                {canCreate && (
                                    <Button onClick={openCreate} size="sm">
                                        <Plus className="size-4 mr-1" />
                                        {t('Add Vehicle')}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className={viewMode === 'table' ? 'p-0' : 'pt-0'}>
                            {/* ── TABLE VIEW ── */}
                            {viewMode === 'table' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('Name')}</TableHead>
                                            <TableHead>{t('Registration number')}</TableHead>
                                            <TableHead>{t('Status')}</TableHead>
                                            <TableHead>{t('Created')}</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isEmpty ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                    <Car className="size-8 mx-auto mb-2 opacity-30" />
                                                    {hasActiveFilter ? t('No vehicles match your search.') : t('No vehicles yet.')}
                                                </TableCell>
                                            </TableRow>
                                        ) : filtered.map(vehicle => (
                                            <TableRow key={vehicle.id} className={cn(vehicle.deleted_at && 'opacity-50')}>
                                                <TableCell>
                                                    <div className="font-medium">{vehicle.name}</div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{vehicle.registration_number}</TableCell>
                                                <TableCell><ActiveBadge isActive={vehicle.is_active} /></TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(vehicle.created_at)}</TableCell>
                                                <TableCell>
                                                    <VehicleActions
                                                        vehicle={vehicle}
                                                        canEdit={canEdit}
                                                        canDelete={canDelete}
                                                        onEdit={openEdit}
                                                        onDelete={setDeletingVehicle}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {/* ── CARD VIEW ── */}
                            {viewMode === 'card' && (
                                isEmpty ? (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <Car className="size-10 mx-auto mb-3 opacity-30" />
                                        <p>{hasActiveFilter ? t('No vehicles match your search.') : t('No vehicles yet.')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                                        {filtered.map(vehicle => (
                                            <div
                                                key={vehicle.id}
                                                className={cn(
                                                    'group flex flex-col rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md',
                                                    vehicle.deleted_at && 'opacity-50'
                                                )}
                                            >
                                                {/* Icon area */}
                                                <div className="flex items-center justify-center h-24 bg-muted">
                                                    <Car className="size-12 text-muted-foreground/40" />
                                                </div>

                                                {/* Body */}
                                                <div className="flex flex-col flex-1 p-3 gap-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
                                                            {vehicle.name}
                                                        </h3>
                                                        <div className="shrink-0">
                                                            <VehicleActions
                                                                vehicle={vehicle}
                                                                canEdit={canEdit}
                                                                canDelete={canDelete}
                                                                onEdit={openEdit}
                                                                onDelete={setDeletingVehicle}
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs font-mono text-muted-foreground">{vehicle.registration_number}</p>

                                                    {/* Footer */}
                                                    <div className="mt-auto pt-2 border-t flex items-center justify-between">
                                                        <ActiveBadge isActive={vehicle.is_active} />
                                                        <span className="text-xs text-muted-foreground">{formatDate(vehicle.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create / Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingVehicle ? t('Edit Vehicle') : t('Add Vehicle')}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                        <VehicleForm
                            vehicle={editingVehicle}
                            onSuccess={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete confirmation */}
            <AlertDialog open={!!deletingVehicle} onOpenChange={open => !open && setDeletingVehicle(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Delete Vehicle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('Are you sure you want to delete')} <strong>{deletingVehicle?.name}</strong>?
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
