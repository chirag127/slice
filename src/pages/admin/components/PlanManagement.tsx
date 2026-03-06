import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { type CommissionPlan, type Tier } from '../../../lib/CommissionEngine';
import { Plus, Trash2 } from 'lucide-react';

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<CommissionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<CommissionPlan>>({ type: 'flat', tiers: [] });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const plansSnap = await getDocs(collection(db, 'commission_plans'));
      setPlans(plansSnap.docs.map(doc => doc.data() as CommissionPlan));
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan.name) return;

    const planId = currentPlan.plan_id || crypto.randomUUID();
    const planToSave: CommissionPlan = {
      plan_id: planId,
      name: currentPlan.name,
      type: currentPlan.type as 'flat' | 'tiered',
      flatPercentage: currentPlan.type === 'flat' ? currentPlan.flatPercentage : undefined,
      tiers: currentPlan.type === 'tiered' ? currentPlan.tiers : undefined,
    };

    try {
      await setDoc(doc(db, 'commission_plans', planId), planToSave);
      setIsEditing(false);
      setCurrentPlan({ type: 'flat', tiers: [] });
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deleteDoc(doc(db, 'commission_plans', planId));
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const addTier = () => {
    setCurrentPlan(prev => ({
      ...prev,
      tiers: [...(prev.tiers || []), { threshold: 0, percentage: 0 }]
    }));
  };

  const updateTier = (index: number, field: keyof Tier, value: number) => {
    const newTiers = [...(currentPlan.tiers || [])];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setCurrentPlan(prev => ({ ...prev, tiers: newTiers }));
  };

  const removeTier = (index: number) => {
    const newTiers = [...(currentPlan.tiers || [])];
    newTiers.splice(index, 1);
    setCurrentPlan(prev => ({ ...prev, tiers: newTiers }));
  };

  if (loading) return <div>Loading plans...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-primary">Manage Plans</h3>
        <button
          onClick={() => {
            setCurrentPlan({ type: 'flat', tiers: [] });
            setIsEditing(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Plan
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSavePlan} className="bg-gray-50 p-4 rounded-md border border-border mb-6 space-y-4">
          <h4 className="text-md font-medium">{currentPlan.plan_id ? 'Edit Plan' : 'New Plan'}</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-secondary">Plan Name</label>
              <input
                type="text"
                required
                value={currentPlan.name || ''}
                onChange={e => setCurrentPlan(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Type</label>
              <select
                value={currentPlan.type || 'flat'}
                onChange={e => setCurrentPlan(prev => ({ ...prev, type: e.target.value as 'flat' | 'tiered' }))}
                className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              >
                <option value="flat">Flat Rate</option>
                <option value="tiered">Tiered (Marginal)</option>
              </select>
            </div>
          </div>

          {currentPlan.type === 'flat' && (
            <div>
              <label className="block text-sm font-medium text-secondary">Flat Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                required
                value={currentPlan.flatPercentage || ''}
                onChange={e => setCurrentPlan(prev => ({ ...prev, flatPercentage: parseFloat(e.target.value) }))}
                className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              />
            </div>
          )}

          {currentPlan.type === 'tiered' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">Tiers</label>
              {currentPlan.tiers?.map((tier, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 mr-2">Amount {'>'}</span>
                    <input
                      type="number"
                      required
                      placeholder="Threshold"
                      value={tier.threshold}
                      onChange={e => updateTier(index, 'threshold', parseFloat(e.target.value))}
                      className="inline-block w-32 border border-border rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 mr-2">Earns</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="%"
                      value={tier.percentage}
                      onChange={e => updateTier(index, 'percentage', parseFloat(e.target.value))}
                      className="inline-block w-24 border border-border rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                    />
                    <span className="text-xs text-gray-500 ml-1">%</span>
                  </div>
                  <button type="button" onClick={() => removeTier(index)} className="text-danger hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTier}
                className="mt-2 text-sm text-accent hover:text-blue-600 font-medium"
              >
                + Add Tier Bracket
              </button>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-secondary bg-surface hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              Save Plan
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface shadow overflow-hidden sm:rounded-md border border-border">
        <ul className="divide-y divide-border">
          {plans.map(plan => (
            <li key={plan.plan_id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div>
                  <h4 className="text-sm font-medium text-accent">{plan.name}</h4>
                  <p className="mt-1 text-sm text-secondary">
                    Type: <span className="font-semibold">{plan.type}</span>
                    {plan.type === 'flat' && ` - ${plan.flatPercentage}%`}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => { setCurrentPlan(plan); setIsEditing(true); }}
                    className="text-sm text-secondary hover:text-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.plan_id)}
                    className="text-sm text-danger hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
          {plans.length === 0 && !isEditing && (
            <li className="px-4 py-8 text-center text-sm text-secondary">No plans created yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PlanManagement;
