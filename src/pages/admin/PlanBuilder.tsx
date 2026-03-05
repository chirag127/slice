import { useState } from 'react';
import {
    Plus,
    Trash2,
    Save,
    Info
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { CommissionPlan, CommissionTier } from '../../lib/engine/types';

export default function PlanBuilder() {
    const [name, setName] = useState('');
    const [baseRate, setBaseRate] = useState(0.05);
    const [isCumulative, setIsCumulative] = useState(true);
    const [quota, setQuota] = useState(1000000);
    const [acceleratorRate, setAcceleratorRate] = useState(0.10);
    const [tiers, setTiers] = useState<CommissionTier[]>([]);
    const [saving, setSaving] = useState(false);

    function addTier() {
        setTiers([...tiers, { threshold: 0, rate: 0.10 }]);
    }

    function removeTier(index: number) {
        setTiers(tiers.filter((_, i) => i !== index));
    }

    function updateTier(index: number, field: keyof CommissionTier, value: number) {
        const newTiers = [...tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        setTiers(newTiers);
    }

    async function handleSave() {
        if (!name) return alert("Plan name is required");
        setSaving(true);
        try {
            const planData: Omit<CommissionPlan, 'id'> = {
                name,
                baseRate,
                isCumulative,
                tiers: [...tiers].sort((a, b) => a.threshold - b.threshold),
                quota,
                acceleratorRate
            };

            await addDoc(collection(db, 'plans'), {
                ...planData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            alert("Plan saved successfully!");
            // Reset form
            setName('');
            setTiers([]);
        } catch (err) {
            console.error(err);
            alert("Failed to save plan");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 text-black">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Commission Plan Builder</h1>
                    <p className="text-gray-500">Design custom payout structures for your sales teams.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Plan'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: General Settings */}
                <div className="space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        General Settings <Info className="w-4 h-4 text-gray-400" />
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Name</label>
                            <input
                                type="text"
                                placeholder="e.g. 2026 Enterprise AEs"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Base Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                                    value={baseRate * 100}
                                    onChange={(e) => setBaseRate(Number(e.target.value) / 100)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Calculation</label>
                                <select
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                                    value={isCumulative ? 'cumulative' : 'marginal'}
                                    onChange={(e) => setIsCumulative(e.target.value === 'cumulative')}
                                >
                                    <option value="cumulative">Cumulative Tiers</option>
                                    <option value="marginal">Marginal Tiers</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Accelerator Options</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Target Quota</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                                        value={quota}
                                        onChange={(e) => setQuota(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Target Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                                        value={acceleratorRate * 100}
                                        onChange={(e) => setAcceleratorRate(Number(e.target.value) / 100)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Tiers */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">Commission Tiers</h2>
                        <button
                            onClick={addTier}
                            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="w-4 h-4" /> Add Tier
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tiers.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                                No custom tiers added. Base rate will apply.
                            </div>
                        ) : (
                            tiers.map((tier, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative group animate-in slide-in-from-top-1 duration-200">
                                    <button
                                        onClick={() => removeTier(idx)}
                                        className="absolute -right-2 -top-2 w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Threshold ({'>='})</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium"
                                                value={tier.threshold}
                                                onChange={(e) => updateTier(idx, 'threshold', Number(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Rate (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium"
                                                value={tier.rate * 100}
                                                onChange={(e) => updateTier(idx, 'rate', Number(e.target.value) / 100)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Heads up:</strong> {isCumulative ? 'Cumulative' : 'Marginal'} calculation mode is active.
                                Ensure your thresholds are sequential for logical payouts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
