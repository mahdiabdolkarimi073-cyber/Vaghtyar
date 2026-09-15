'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, MapPin, ChevronDown, Building2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type City = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
  neighborhoods: Neighborhood[];
};

type Neighborhood = {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  businessCount: number;
};

export default function AdminLocationsPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

  // City dialog state
  const [showCityDialog, setShowCityDialog] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityForm, setCityForm] = useState({ name: '' });

  // Neighborhood dialog state
  const [showNeighborhoodDialog, setShowNeighborhoodDialog] = useState(false);
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null);
  const [neighborhoodForm, setNeighborhoodForm] = useState({ name: '', cityId: '' });

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'city' | 'neighborhood'; name: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/locations');
      const d = await res.json();
      setCities(d.cities || []);
    } catch {
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // City actions
  const openAddCity = () => {
    setEditingCity(null);
    setCityForm({ name: '' });
    setShowCityDialog(true);
  };

  const openEditCity = (city: City) => {
    setEditingCity(city);
    setCityForm({ name: city.name });
    setShowCityDialog(true);
  };

  const saveCity = async () => {
    if (!cityForm.name.trim()) {
      toast.error('نام شهر الزامی است');
      return;
    }
    try {
      const res = await fetch(
        editingCity
          ? `/api/admin/locations/${editingCity.id}`
          : '/api/admin/locations',
        {
          method: editingCity ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'city', name: cityForm.name }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'خطا');
      }
      toast.success(editingCity ? 'شهر ویرایش شد' : 'شهر افزوده شد');
      setShowCityDialog(false);
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  // Neighborhood actions
  const openAddNeighborhood = (cityId: string) => {
    setEditingNeighborhood(null);
    setNeighborhoodForm({ name: '', cityId });
    setShowNeighborhoodDialog(true);
  };

  const openEditNeighborhood = (n: Neighborhood) => {
    setEditingNeighborhood(n);
    setNeighborhoodForm({ name: n.name, cityId: n.cityId });
    setShowNeighborhoodDialog(true);
  };

  const saveNeighborhood = async () => {
    if (!neighborhoodForm.name.trim()) {
      toast.error('نام محله الزامی است');
      return;
    }
    if (!neighborhoodForm.cityId) {
      toast.error('انتخاب شهر الزامی است');
      return;
    }
    try {
      const res = await fetch(
        editingNeighborhood
          ? `/api/admin/locations/${editingNeighborhood.id}`
          : '/api/admin/locations',
        {
          method: editingNeighborhood ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'neighborhood',
            name: neighborhoodForm.name,
            cityId: neighborhoodForm.cityId,
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'خطا');
      }
      toast.success(editingNeighborhood ? 'محله ویرایش شد' : 'محله افزوده شد');
      setShowNeighborhoodDialog(false);
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `/api/admin/locations/${deleteTarget.id}?type=${deleteTarget.type}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'خطا');
      }
      toast.success(deleteTarget.type === 'city' ? 'شهر حذف شد' : 'محله حذف شد');
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="شهرها و محله‌ها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={openAddCity}
              className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" /> افزودن شهر
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="admin-card p-5 h-20 admin-skeleton rounded-2xl" />
              ))}
            </div>
          ) : cities.length === 0 ? (
            <div className="admin-card rounded-2xl p-12 text-center text-text-muted">
              شهری ثبت نشده است
            </div>
          ) : (
            <div className="space-y-3">
              {cities.map((city) => {
                const isExpanded = expandedCity === city.id;
                return (
                  <div key={city.id} className="admin-card rounded-2xl overflow-hidden">
                    {/* City header row */}
                    <div className="flex items-center justify-between p-4">
                      <button
                        onClick={() => setExpandedCity(isExpanded ? null : city.id)}
                        className="flex items-center gap-3 flex-1 text-right"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-bold text-text-primary">{city.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge variant="primary">
                              {toPersianDigits(city.businessCount || 0)} کسب‌وکار
                            </StatusBadge>
                            <StatusBadge variant="neutral">
                              {toPersianDigits(city.neighborhoods?.length || 0)} محله
                            </StatusBadge>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-text-muted mr-2 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditCity(city)}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: city.id,
                              type: 'city',
                              name: city.name,
                            })
                          }
                          className="p-1.5 rounded-lg text-error hover:bg-error/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Neighborhoods list (expandable) */}
                    {isExpanded && (
                      <div className="border-t border-border bg-surface/50">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-text-secondary">
                              محله‌های {city.name}
                            </span>
                            <button
                              onClick={() => openAddNeighborhood(city.id)}
                              className="text-primary text-sm font-medium flex items-center gap-1 hover:bg-primary/10 px-2 py-1 rounded-lg"
                            >
                              <Plus className="w-4 h-4" /> افزودن محله
                            </button>
                          </div>

                          {city.neighborhoods && city.neighborhoods.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {city.neighborhoods.map((n) => (
                                <div
                                  key={n.id}
                                  className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 group"
                                >
                                  <Building2 className="w-3.5 h-3.5 text-text-muted" />
                                  <span className="text-sm text-text-primary">{n.name}</span>
                                  <button
                                    onClick={() => openEditNeighborhood(n)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-primary hover:bg-primary/10"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteTarget({
                                        id: n.id,
                                        type: 'neighborhood',
                                        name: n.name,
                                      })
                                    }
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-error hover:bg-error/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-text-muted py-2">
                              محله‌ای ثبت نشده است
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* City Dialog */}
      <Dialog open={showCityDialog} onOpenChange={setShowCityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCity ? 'ویرایش شهر' : 'افزودن شهر جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">نام شهر</label>
              <input
                value={cityForm.name}
                onChange={(e) => setCityForm({ name: e.target.value })}
                className="admin-input w-full h-10 px-4 text-sm"
                placeholder="مثلاً تهران"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowCityDialog(false)}
              className="admin-input px-4 py-2 rounded-xl text-sm"
            >
              انصراف
            </button>
            <button
              onClick={saveCity}
              className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              ذخیره
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Neighborhood Dialog */}
      <Dialog open={showNeighborhoodDialog} onOpenChange={setShowNeighborhoodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNeighborhood ? 'ویرایش محله' : 'افزودن محله جدید'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">نام محله</label>
              <input
                value={neighborhoodForm.name}
                onChange={(e) =>
                  setNeighborhoodForm({ ...neighborhoodForm, name: e.target.value })
                }
                className="admin-input w-full h-10 px-4 text-sm"
                placeholder="مثلاً سعادت‌آباد"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">شهر</label>
              <select
                value={neighborhoodForm.cityId}
                onChange={(e) =>
                  setNeighborhoodForm({ ...neighborhoodForm, cityId: e.target.value })
                }
                className="admin-input w-full h-10 px-4 text-sm"
                disabled={!!editingNeighborhood}
              >
                <option value="">انتخاب شهر</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowNeighborhoodDialog(false)}
              className="admin-input px-4 py-2 rounded-xl text-sm"
            >
              انصراف
            </button>
            <button
              onClick={saveNeighborhood}
              className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              ذخیره
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === 'city' ? 'حذف شهر' : 'حذف محله'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleteTarget?.name}» اطمینان دارید؟
              {deleteTarget?.type === 'city' &&
                ' در صورت وجود کسب‌وکار در این شهر، حذف ممکن نخواهد بود.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-error hover:bg-red-600"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
