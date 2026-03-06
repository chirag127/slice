import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { CommissionEngine } from './engine/CommissionEngine';
import { CycleManager } from './engine/CycleManager';
import type { Transaction, CommissionPlan } from './engine/types';
import { AuditEngine } from './engine/AuditTrail';

export class PayoutBatchManager {
  static async generateMonthlyPayouts(month: string, authUser?: { uid: string, email: string }) { // month format "YYYY-MM"
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

      // --- Task 107: Carryover Logic ---
      // 1. Determine previous month ID
      const [year, monthNum] = month.split('-').map(Number);
      const prevDate = new Date(year, monthNum - 2, 1);
      const prevMonthId = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

      // 2. Fetch previous payout for carryover
      let priorBalance = 0;
      const prevPayoutQ = query(
        collection(db, 'payouts'),
        where('repId', '==', repId),
        where('month', '==', prevMonthId)
      );
      const prevPayoutSnap = await getDocs(prevPayoutQ);
      if (!prevPayoutSnap.empty) {
        priorBalance = prevPayoutSnap.docs[0].data().nextCarryover || 0;
      }

      const summary = CommissionEngine.calculatePayout(repGroups[repId], plan, priorBalance);

      const payoutDoc = {
        repId,
        repEmail: userData.email,
        month,
        planId: plan.id,
        planName: plan.name,
        ...summary,
        status: 'generated',
        createdAt: serverTimestamp(),
        // Metadata for Task 108: Audit Trail
        generatedBy: 'system',
        version: '1.0'
      };

      const docRef = await addDoc(collection(db, 'payouts'), payoutDoc);
      results.push({ id: docRef.id, ...payoutDoc });
    }

    if (authUser && results.length > 0) {
      await AuditEngine.log(
        'PAYOUT_GENERATED',
        { uid: authUser.uid, email: authUser.email },
        `Generated ${results.length} payouts for period ${month}.`,
        { count: results.length, month }
      );
    }

    return results;
  }
}
