'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

interface DayData {
  pushups: number;
  water: number;
  money: number;
  workout: boolean;
  learned: boolean;
  notes: string;
}

const HABITS = [
  { id: 'pushups', label: 'Push-ups', icon: '💪', goal: 30 },
  { id: 'water', label: 'Water (L)', icon: '💧', goal: 4 },
  { id: 'money', label: 'Spend', icon: '💰', goal: 500 },
  { id: 'workout', label: 'Workout', icon: '🏋️' },
  { id: 'learned', label: 'Learn', icon: '📚' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DailyTrackerContent() {
  const now = new Date();
  const [monthStart, setMonthStart] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
  const [allDayData, setAllDayData] = useState<Record<string, DayData>>({});
  const [modalDay, setModalDay] = useState<Date | null>(null);
  const [modalData, setModalData] = useState<DayData>({
    pushups: 0,
    water: 0,
    money: 0,
    workout: false,
    learned: false,
    notes: ''
  });

  const dateToStr = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const data: Record<string, DayData> = {};
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today.getTime() - i * 86400000);
      const dateStr = dateToStr(d);
      const saved = localStorage.getItem(`dt-daily-${dateStr}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        data[dateStr] = {
          pushups: parsed.pushups || 0,
          water: parsed.waterGlasses || 0,
          money: parsed.moneySpent || 0,
          workout: (parsed.gymDone && parsed.gymDone.length > 0) || false,
          learned: (parsed.learnedToday && parsed.learnedToday.length > 0) || false,
          notes: parsed.notes || ''
        };
      }
    }
    setAllDayData(data);
  }, []);

  const saveData = (date: Date, data: DayData) => {
    const dateStr = dateToStr(date);
    const existing = localStorage.getItem(`dt-daily-${dateStr}`);
    const full = existing ? JSON.parse(existing) : {};

    full.pushups = data.pushups;
    full.waterGlasses = data.water;
    full.moneySpent = data.money;
    full.gymDone = data.workout ? ['completed'] : [];
    full.learnedToday = data.learned ? ['completed'] : [];
    full.notes = data.notes;

    localStorage.setItem(`dt-daily-${dateStr}`, JSON.stringify(full));
    setAllDayData(prev => ({ ...prev, [dateStr]: data }));
  };

  const getDayData = (date: Date): DayData => {
    return allDayData[dateToStr(date)] || {
      pushups: 0,
      water: 0,
      money: 0,
      workout: false,
      learned: false,
      notes: ''
    };
  };

  const getDayScore = (date: Date): number => {
    const d = getDayData(date);
    let score = 0;
    if (d.pushups >= 30) score += 25;
    if (d.water >= 4) score += 25;
    if (d.money <= 500) score += 20;
    if (d.workout) score += 20;
    if (d.learned) score += 10;
    return score;
  };

  const openModal = (date: Date) => {
    setModalDay(date);
    setModalData(getDayData(date));
  };

  const closeModal = () => {
    setModalDay(null);
  };

  const saveModal = () => {
    if (modalDay) {
      saveData(modalDay, modalData);
      closeModal();
    }
  };

  // Get calendar grid for the month
  const firstDay = monthStart.getDay();
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const calendarDays: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), i));
  }

  const monthStr = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full h-screen overflow-hidden p-2 md:p-3" style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1428 50%, #0a1020 100%)',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-2">
        <h1 className="text-lg md:text-2xl font-black text-white">Daily Tracker</h1>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1))}
            className="p-1 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <ChevronLeft size={16} style={{ color: '#fff' }} />
          </motion.button>
          <span className="text-xs md:text-sm font-bold text-white min-w-32 text-center">{monthStr}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1))}
            className="p-1 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <ChevronRight size={16} style={{ color: '#fff' }} />
          </motion.button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Habit Rows */}
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {HABITS.map((habit) => (
            <div key={habit.id} className="flex-shrink-0">
              {/* Habit Label */}
              <div className="flex items-center gap-1 mb-1">
                <div className="px-2 py-1 rounded text-center font-bold text-white text-xs flex-shrink-0 min-w-20"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>{habit.icon} {habit.label}</span>
                </div>
              </div>

              {/* Calendar Grid for this habit */}
              <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {/* Day Headers */}
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.125rem' }}>
                  {DAY_NAMES.map(day => (
                    <div key={day} className="text-center font-bold text-white text-xs p-1 rounded"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', fontSize: '10px' }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.125rem' }}>
                  {calendarDays.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} />;

                    const data = getDayData(date);
                    const isToday = dateToStr(date) === dateToStr(now);
                    const value = data[habit.id as keyof DayData];
                    const isBoolean = typeof value === 'boolean';

                    let cellBg = 'rgba(255,255,255,0.04)';
                    let cellColor = '#b1bad3';

                    if (isBoolean) {
                      cellBg = value ? 'rgba(0,230,118,0.2)' : 'rgba(255,255,255,0.04)';
                      cellColor = value ? '#00e676' : '#718096';
                    } else {
                      const percent = value / (habit.id === 'money' ? habit.goal : habit.goal);
                      if (percent >= 1) {
                        cellBg = 'rgba(0,230,118,0.2)';
                        cellColor = '#00e676';
                      } else if (percent >= 0.7) {
                        cellBg = 'rgba(0,184,148,0.15)';
                        cellColor = '#00b894';
                      } else if (percent >= 0.3) {
                        cellBg = 'rgba(255,165,2,0.15)';
                        cellColor = '#ffa502';
                      } else if (value > 0) {
                        cellBg = 'rgba(255,107,53,0.15)';
                        cellColor = '#ff6b35';
                      }
                    }

                    return (
                      <motion.button
                        key={dateToStr(date)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => openModal(date)}
                        className="rounded text-center cursor-pointer font-bold text-xs p-1"
                        style={{
                          backgroundColor: cellBg,
                          color: cellColor,
                          border: isToday ? '1.5px solid rgba(0,230,118,0.6)' : '0.5px solid rgba(255,255,255,0.1)',
                          minHeight: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px'
                        }}>
                        {isBoolean ? (
                          <span>{value ? '✓' : '○'}</span>
                        ) : (
                          <span>{value}{data.notes ? '📝' : ''}</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br rounded-2xl p-4 md:p-6 max-w-sm w-full"
              style={{
                background: 'linear-gradient(135deg, rgba(13,20,40,0.95), rgba(20,30,50,0.95))',
                border: '1px solid rgba(0,230,118,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}>

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black text-white">{modalDay.toLocaleDateString()}</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-1 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <X size={18} style={{ color: '#fff' }} />
                </motion.button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto mb-3">
                {HABITS.map((habit) => {
                  const value = modalData[habit.id as keyof typeof modalData];
                  const isBoolean = typeof value === 'boolean';

                  return (
                    <div key={habit.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex items-center gap-2 text-sm">
                        <span>{habit.icon}</span>
                        <span className="font-bold text-white">{habit.label}</span>
                      </div>
                      {isBoolean ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setModalData(prev => ({ ...prev, [habit.id]: !prev[habit.id as keyof typeof prev] }))}
                          className="w-7 h-7 rounded text-sm font-bold flex items-center justify-center"
                          style={{
                            backgroundColor: value ? 'rgba(0,230,118,0.2)' : 'rgba(255,255,255,0.1)',
                            color: value ? '#00e676' : '#718096',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}>
                          {value ? '✓' : '○'}
                        </motion.button>
                      ) : (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setModalData(prev => ({ ...prev, [habit.id]: parseFloat(e.target.value) || 0 }))}
                          className="w-14 px-2 py-1 rounded text-center text-xs font-bold text-white outline-none"
                          style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Notes */}
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <label className="text-xs font-bold text-white mb-1 block">📝 Notes</label>
                  <textarea
                    value={modalData.notes}
                    onChange={(e) => setModalData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add your notes..."
                    className="w-full h-16 p-2 rounded text-xs text-white outline-none resize-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveModal}
                className="w-full py-2 rounded-lg font-bold text-white text-sm"
                style={{ backgroundColor: '#00e676', color: '#000' }}>
                Save
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DailyTrackerPage() {
  return (
    <PageShell>
      <DailyTrackerContent />
    </PageShell>
  );
}
