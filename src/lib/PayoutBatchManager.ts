import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { CommissionEngine } from './engine/CommissionEngine';
import { CycleManager } from './engine/CycleManager';
import type { Transaction, CommissionPlan } from './engine/types';

export class PayoutBatchManager {
  static async generateMonthlyPayouts(month: string) { // month format "YYYY-MM"
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('status', '==', 'processed'));
    const snap = await getDocs(q);
    const transactions = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));

    // Filter by month using CycleManager
    const monthTransactions = transactions.filter(t => CycleManager.getCycle(t.date, 'monthly') === month);

    // Group by rep
    const repGroups: Record<string, Transaction[]> = {};
    monthTransactions.forEach(t => {
      if (!repGroups[t.repId]) repGroups[t.repId] = [];
      repGroups[t.repId].push(t);
    });

    const results = [];

    for (const repId in repGroups) {
      // Get Rep's Plan
      const userRef = doc(db, 'users', repId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (!userData?.planId) continue;

      const planRef = doc(db, 'plans', userData.planId as string);
      const planSnap = await getDoc(planRef);
      const planData = planSnap.data();
      if (!planData) continue;

      const plan = { id: planSnap.id, ...planData } as CommissionPlan;

      const summary = CommissionEngine.calculatePayout(repGroups[repId], plan);

      const payoutDoc = {
        repId,
        repEmail: userData.email,
        month,
        planId: plan.id,
        planName: plan.name,
        ...summary,
        status: 'generated',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'payouts'), payoutDoc);
      results.push({ id: docRef.id, ...payoutDoc });
    }

    return results;
  }
}
