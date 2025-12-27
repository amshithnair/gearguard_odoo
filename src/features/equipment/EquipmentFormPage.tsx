import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Trash2, Wrench, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Equipment } from '../../types';

export const EquipmentFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { equipment, categories, users, teams, addEquipment, updateEquipment, deleteEquipment, requests } = useStore();

    const isNew = id === 'new';
    const existingEquipment = equipment.find(e => e.id === id);

    // Maintenance Count for Smart Button
    const maintenanceCount = requests.filter(r => r.equipmentId === id).length;

    const { register, handleSubmit, formState: { errors } } = useForm<Equipment>({
        defaultValues: existingEquipment || {
            status: 'active',
            healthScore: 100,
            location: '',
            category: 'Machinery', // Default
        }
    });

    const onSubmit = (data: Equipment) => {
        if (isNew) {
            addEquipment({ ...data, id: `eq-${Date.now()}` });
        } else if (id) {
            updateEquipment(id, data);
        }
        navigate('/master/equipment');
    };

    const handleDelete = () => {
        if (id && confirm('Are you sure you want to delete this equipment?')) {
            deleteEquipment(id);
            navigate('/master/equipment');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 max-w-[1200px] mx-auto"
        >
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/master/equipment')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <h1 className="text-2xl font-bold font-display text-slate-800">
                        {isNew ? 'New Equipment' : existingEquipment?.name}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {!isNew && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors bg-white font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                    <button
                        onClick={handleSubmit(onSubmit)}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                {/* Smart Button Area - Top Right Absolute */}
                {!isNew && (
                    <div className="absolute top-0 right-0 p-0 z-10">
                        <div className="flex border-l border-b border-slate-200 bg-slate-50 rounded-bl-xl">
                            <button className="flex flex-col items-center justify-center w-32 py-2 px-1 hover:bg-slate-100 transition-colors group border-r border-slate-200 last:border-r-0">
                                <div className="flex items-center gap-2 text-primary-600 mb-0.5">
                                    <Wrench className="w-5 h-5" />
                                    <span className="text-lg font-bold">{maintenanceCount}</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider group-hover:text-primary-600 transition-colors">Maintenance</span>
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-8 pt-12">
                    {/* Main Identifier */}
                    <div className="max-w-xl mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-600">Equipment</h2>
                            <div className="h-px flex-1 bg-slate-100"></div>
                        </div>
                        <label className="block text-2xl font-display font-bold text-slate-400 mb-2">
                            Name?
                        </label>
                        <input
                            {...register('name', { required: true })}
                            className="w-full text-3xl font-bold text-slate-900 border-b-2 border-slate-200 focus:border-primary-500 focus:outline-none bg-transparent placeholder:text-slate-300 transition-colors pb-2"
                            placeholder="e.g. Samsung Monitor 15&quot;"
                        />
                        {errors.name && <span className="text-red-500 text-sm mt-1">Name is required</span>}
                    </div>

                    {/* OEE Stats - The "Money Shot" for Hackathon */}
                    {existingEquipment?.oeeAvailability !== undefined && (
                        <div className="mb-8 bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Overall Equipment Effectiveness (OEE)</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Availability</div>
                                    <div className={clsx("text-2xl font-bold", (existingEquipment.oeeAvailability || 0) < 80 ? "text-red-500" : "text-green-600")}>
                                        {existingEquipment.oeeAvailability}%
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className={clsx("h-full rounded-full", (existingEquipment.oeeAvailability || 0) < 80 ? "bg-red-500" : "bg-green-500")} style={{ width: `${existingEquipment.oeeAvailability}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Performance</div>
                                    <div className="text-2xl font-bold text-slate-800">{existingEquipment.oeePerformance}%</div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${existingEquipment.oeePerformance}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Quality</div>
                                    <div className="text-2xl font-bold text-slate-800">{existingEquipment.oeeQuality}%</div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${existingEquipment.oeeQuality}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Equipment Category?</label>
                                <select {...register('category')} className="form-input text-sm">
                                    {categories.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Company?</label>
                                <input {...register('department')} placeholder="Department/Company" className="form-input text-sm" />
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Used By?</label>
                                <select {...register('partnerId')} className="form-input text-sm">
                                    <option value="">Select Partner</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div className="h-6"></div> {/* Spacer */}

                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-2">Maintenance</h3>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Maintenance Team?</label>
                                <select {...register('teamId')} className="form-input text-sm">
                                    <option value="">Select Team</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Technician?</label>
                                <select {...register('technicianId')} className="form-input text-sm">
                                    <option value="">Select Technician</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Assigned Date?</label>
                                <input type="date" {...register('assignedDate')} className="form-input text-sm" />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Current Location?</label>
                                <input {...register('location')} className="form-input text-sm" />
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Work Center?</label>
                                <input {...register('workCenter')} className="form-input text-sm" />
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Scrap Date?</label>
                                <input type="date" {...register('scrapDate')} className="form-input text-sm" />
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm font-semibold text-slate-600">Warranty Expiration?</label>
                                <input type="date" {...register('warrantyExpiration')} className="form-input text-sm" />
                            </div>

                            <div className="h-6"></div> {/* Spacer */}

                            {/* Description Box */}
                            <div className="col-span-2 mt-4">
                                <label className="text-sm font-semibold text-slate-600 block mb-2">Description</label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none bg-slate-50"
                                    placeholder="Add notes about this equipment..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .form-input {
                    @apply w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400;
                }
            `}</style>
        </motion.div>
    );
};
