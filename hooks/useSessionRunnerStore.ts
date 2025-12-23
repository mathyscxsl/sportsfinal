import { sessionExerciseRepository } from '@/services/repositories/SessionExerciseRepository';
import { sessionRepository } from '@/services/repositories/SessionRepository';
import { workoutExerciseRepository } from '@/services/repositories/WorkoutExerciseRepository';
import { workoutRepository } from '@/services/repositories/WorkoutRepository';
import { workoutSetRepository } from '@/services/repositories/WorkoutSetRepository';
import Sound from '@/services/sound';
import { create } from 'zustand';

type ExerciseRuntime = {
    sessionExerciseId: number;
    workoutExerciseId: number;
    name: string;
    orderIndex: number;
    setsTarget?: number | null;
    targetReps?: number | null;
    targetDurationSeconds?: number | null;
    restSecondsBetweenSets?: number | null;
    workSeconds?: number | null;
    restSeconds?: number | null;
    emomIntervalSeconds?: number | null;
    notes?: string | null;
    currentSet: number;
    totalReps: number;
    totalDurationSeconds: number;
};

type RunnerStatus = 'idle' | 'running' | 'paused' | 'rest';
type RunnerMode = 'DEFAULT' | 'HIIT' | 'AMRAP' | 'EMOM';

type SessionRunnerState = {
    sessionId?: number;
    workoutId?: number;
    startedAt?: number;
    endedAt?: number;

    elapsedSeconds: number;
    restRemainingSeconds?: number | null;
    status: RunnerStatus;
    timerHandle?: any;

    // mode & HIIT
    mode: RunnerMode;
    hiitWorkSeconds?: number | null;
    hiitRestSeconds?: number | null;
    hiitTotalDurationSeconds?: number | null;
    hiitTotalRemainingSeconds?: number | null;
    phase?: 'work' | 'rest';
    phaseRemainingSeconds?: number | null;
    // AMRAP
    amrapTotalRemainingSeconds?: number | null;
    // EMOM
    emomIntervalSeconds?: number | null;
    emomRemainingSeconds?: number | null;

    exercises: ExerciseRuntime[];
    currentExerciseIndex: number;

    initialize: (sessionId: number) => Promise<void>;
    start: () => void;
    pause: () => void;
    toggle: () => void;
    nextExercise: () => void;
    prevExercise: () => void;
    addRep: (delta?: number) => void;
    completeSet: () => Promise<void>;
    finish: (notes?: string) => Promise<number | undefined>;
    reset: () => void;
};

export const useSessionRunnerStore = create<SessionRunnerState>((set, get) => ({
    sessionId: undefined,
    workoutId: undefined,
    startedAt: undefined,
    endedAt: undefined,
    elapsedSeconds: 0,
    restRemainingSeconds: null,
    status: 'idle',
    timerHandle: undefined,
    exercises: [],
    currentExerciseIndex: 0,
    mode: 'DEFAULT',
    hiitWorkSeconds: null,
    hiitRestSeconds: null,
    hiitTotalDurationSeconds: null,
    hiitTotalRemainingSeconds: null,
    phase: undefined,
    phaseRemainingSeconds: null,
    amrapTotalRemainingSeconds: null,
    emomIntervalSeconds: null,
    emomRemainingSeconds: null,

    initialize: async (sessionId: number) => {
        const sesExercises = await sessionExerciseRepository.findBySessionIdWithExerciseDetails(sessionId);
        const session = await sessionRepository.findById(sessionId);
        const workout = await workoutRepository.create({
            programId: undefined,
            sessionId,
            startedAt: Date.now(),
            completed: 0,
        });



        const exercises: ExerciseRuntime[] = [];

        for (let i = 0; i < sesExercises.length; i++) {
            const se = sesExercises[i];
            const wex = await workoutExerciseRepository.create({
                workoutId: workout.id,
                sessionExerciseId: se.id,
                exerciseId: se.exerciseId ?? undefined,
                orderIndex: se.orderIndex ?? i,
            });

            exercises.push({
                sessionExerciseId: se.id,
                workoutExerciseId: wex.id,
                name: se.customName || se.exercise?.name || 'Exercice',
                orderIndex: se.orderIndex ?? i,
                setsTarget: se.sets ?? null,
                targetReps: se.targetReps ?? null,
                targetDurationSeconds: se.targetDurationSeconds ?? null,
                restSecondsBetweenSets: se.restSecondsBetweenSets ?? null,
                workSeconds: se.workSeconds ?? null,
                restSeconds: se.restSeconds ?? null,
                emomIntervalSeconds: se.emomIntervalSeconds ?? null,
                notes: se.notes ?? null,
                currentSet: 1,
                totalReps: 0,
                totalDurationSeconds: 0,
            });
        }

        let mode: RunnerMode = 'DEFAULT';
        let hiitWorkSeconds: number | null = null;
        let hiitRestSeconds: number | null = null;
        let hiitTotalDurationSeconds: number | null = null;
        let phase: 'work' | 'rest' | undefined = undefined;
        let phaseRemainingSeconds: number | null = null;
        let hiitTotalRemainingSeconds: number | null = null;
        let amrapTotalRemainingSeconds: number | null = null;
        let emomIntervalSeconds: number | null = null;
        let emomRemainingSeconds: number | null = null;

        if (session?.type === 'HIIT' && session.repeatRule) {
            try {
                const parsed = JSON.parse(session.repeatRule);
                const cfg = parsed?.typeConfig?.hiit;
                if (cfg) {
                    mode = 'HIIT';
                    hiitWorkSeconds = cfg.workSeconds ?? null;
                    hiitRestSeconds = cfg.restSeconds ?? null;
                    hiitTotalDurationSeconds = cfg.totalDurationSeconds ?? null;
                    phase = 'work';
                    phaseRemainingSeconds = hiitWorkSeconds;
                    hiitTotalRemainingSeconds = hiitTotalDurationSeconds;
                }
            } catch { }
        } else if (session?.type === 'AMRAP' && session.repeatRule) {
            try {
                const parsed = JSON.parse(session.repeatRule);
                const cfg = parsed?.typeConfig?.amrap;
                if (cfg) {
                    mode = 'AMRAP';
                    amrapTotalRemainingSeconds = cfg.durationSeconds ?? null;
                }
            } catch { }
        } else if (session?.type === 'EMOM' && session.repeatRule) {
            try {
                const parsed = JSON.parse(session.repeatRule);
                const cfg = parsed?.typeConfig?.emom;
                if (cfg) {
                    mode = 'EMOM';
                    emomIntervalSeconds = cfg.intervalSeconds ?? 60;
                    emomRemainingSeconds = emomIntervalSeconds;
                }
            } catch { }
        }

        set({
            sessionId,
            workoutId: workout.id,
            startedAt: workout.startedAt ?? Date.now(),
            elapsedSeconds: 0,
            status: 'paused',
            exercises,
            currentExerciseIndex: 0,
            mode,
            hiitWorkSeconds,
            hiitRestSeconds,
            hiitTotalDurationSeconds,
            hiitTotalRemainingSeconds,
            phase,
            phaseRemainingSeconds,
            amrapTotalRemainingSeconds,
            emomIntervalSeconds,
            emomRemainingSeconds,
        });
    },

    start: () => {
        const { status, timerHandle } = get();
        if (status === 'running') return;
        if (timerHandle) clearInterval(timerHandle);
        const handle = setInterval(() => {
            const state = get();
            if (state.mode === 'HIIT') {
                if (state.status === 'running' && state.phase === 'work' && state.phaseRemainingSeconds && state.phaseRemainingSeconds > 0) {
                    set({
                        phaseRemainingSeconds: (state.phaseRemainingSeconds - 1),
                        hiitTotalRemainingSeconds: state.hiitTotalRemainingSeconds != null ? Math.max(0, (state.hiitTotalRemainingSeconds - 1)) : null,
                    });
                } else if (state.status === 'running' && state.phase === 'work' && (!state.phaseRemainingSeconds || state.phaseRemainingSeconds <= 0)) {
                    set({ phase: 'rest', phaseRemainingSeconds: state.hiitRestSeconds ?? null });
                } else if (state.status === 'running' && state.phase === 'rest' && state.phaseRemainingSeconds && state.phaseRemainingSeconds > 0) {
                    set({ phaseRemainingSeconds: (state.phaseRemainingSeconds - 1), hiitTotalRemainingSeconds: state.hiitTotalRemainingSeconds != null ? Math.max(0, (state.hiitTotalRemainingSeconds - 1)) : null });
                } else if (state.status === 'running' && state.phase === 'rest' && (!state.phaseRemainingSeconds || state.phaseRemainingSeconds <= 0)) {
                    const ex = state.exercises[state.currentExerciseIndex];
                    if (ex) {
                        const nextSet = ex.currentSet + 1;
                        const duration = state.hiitWorkSeconds ?? undefined;
                        workoutSetRepository.create({ workoutExerciseId: ex.workoutExerciseId, setNumber: ex.currentSet, durationSeconds: duration });
                        set((s) => {
                            const copy = [...s.exercises];
                            copy[s.currentExerciseIndex] = { ...copy[s.currentExerciseIndex], currentSet: nextSet };
                            const nextIndex = copy.length > 0 ? ((s.currentExerciseIndex + 1) % copy.length) : s.currentExerciseIndex;
                            return { exercises: copy, currentExerciseIndex: nextIndex, phase: 'work', phaseRemainingSeconds: s.hiitWorkSeconds ?? null };
                        });
                    } else {
                        set({ phase: 'work', phaseRemainingSeconds: state.hiitWorkSeconds ?? null });
                    }
                }

                const now = get();
                if (now.hiitTotalRemainingSeconds != null && now.hiitTotalRemainingSeconds <= 0) {
                    get().finish();
                }
            } else if (state.mode === 'AMRAP') {
                if (state.status === 'running' && state.amrapTotalRemainingSeconds != null && state.amrapTotalRemainingSeconds > 0) {
                    set({ amrapTotalRemainingSeconds: Math.max(0, state.amrapTotalRemainingSeconds - 1) });
                    if (state.amrapTotalRemainingSeconds - 1 <= 0) {
                        get().finish();
                    }
                }
            } else if (state.mode === 'EMOM') {
                if (state.status === 'running' && state.emomRemainingSeconds != null && state.emomRemainingSeconds > 0) {
                    set({ emomRemainingSeconds: state.emomRemainingSeconds - 1 });
                } else if (state.status === 'running' && (state.emomRemainingSeconds == null || state.emomRemainingSeconds <= 0)) {
                    const st = get();
                    const ex = st.exercises[st.currentExerciseIndex];
                    if (ex) {
                        const nextSet = ex.currentSet + 1;
                        workoutSetRepository.create({ workoutExerciseId: ex.workoutExerciseId, setNumber: ex.currentSet });
                        set((s) => {
                            const copy = [...s.exercises];
                            copy[s.currentExerciseIndex] = { ...copy[s.currentExerciseIndex], currentSet: nextSet };
                            const nextIndex = copy.length > 0 ? ((s.currentExerciseIndex + 1) % copy.length) : s.currentExerciseIndex;
                            return { exercises: copy, currentExerciseIndex: nextIndex, emomRemainingSeconds: s.emomIntervalSeconds ?? 60 };
                        });
                    } else {
                        set({ emomRemainingSeconds: st.emomIntervalSeconds ?? 60 });
                    }
                }
            } else {
                const { status: st, restRemainingSeconds } = state;
                if (st === 'running') {
                    set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
                } else if (st === 'rest') {
                    if (restRemainingSeconds && restRemainingSeconds > 0) {
                        set({ restRemainingSeconds: restRemainingSeconds - 1 });
                    } else {
                        set({ status: 'running', restRemainingSeconds: null });
                    }
                }
            }
        }, 1000);
        set({ status: 'running', timerHandle: handle });
        Sound.play('test.mp3');
    },

    pause: () => {
        const { timerHandle } = get();
        if (timerHandle) clearInterval(timerHandle);
        set({ status: 'paused', timerHandle: undefined });
    },

    toggle: () => {
        const { status } = get();
        if (status === 'running' || status === 'rest') {
            get().pause();
        } else {
            get().start();
        }
    },

    nextExercise: () => {
        const { currentExerciseIndex, exercises } = get();
        if (currentExerciseIndex < exercises.length - 1) {
            set({ currentExerciseIndex: currentExerciseIndex + 1 });
        }
    },

    prevExercise: () => {
        const { currentExerciseIndex, mode } = get();
        if (mode === 'HIIT' || mode === 'EMOM') return;
        if (currentExerciseIndex > 0) set({ currentExerciseIndex: currentExerciseIndex - 1 });
    },

    addRep: (delta = 1) => {
        const { currentExerciseIndex } = get();
        set((state) => {
            const exs = [...state.exercises];
            exs[currentExerciseIndex] = {
                ...exs[currentExerciseIndex],
                totalReps: Math.max(0, exs[currentExerciseIndex].totalReps + delta),
            };
            return { exercises: exs };
        });
    },

    completeSet: async () => {
        const state = get();
        if (state.mode === 'HIIT') {
            return;
        }
        const ex = state.exercises[state.currentExerciseIndex];
        if (!ex || !state.workoutId) return;

        const setNumber = ex.currentSet;
        const reps = ex.totalReps > 0 ? ex.totalReps : undefined;
        await workoutSetRepository.create({
            workoutExerciseId: ex.workoutExerciseId,
            setNumber,
            reps,
            durationSeconds: undefined,
            startedAt: undefined,
            endedAt: undefined,
        });

        const nextSet = setNumber + 1;
        set((s) => {
            const copy = [...s.exercises];
            copy[s.currentExerciseIndex] = {
                ...copy[s.currentExerciseIndex],
                currentSet: nextSet,
                totalReps: 0,
            };
            const rest = ex.restSecondsBetweenSets ?? ex.restSeconds ?? null;
            return {
                exercises: copy,
                status: rest ? 'rest' : s.status,
                restRemainingSeconds: rest ?? null,
            };
        });
    },

    finish: async (notes?: string) => {
        const state = get();
        if (!state.workoutId) return;

        for (const ex of state.exercises) {
            const sets = await workoutSetRepository.findByWorkoutExerciseId(ex.workoutExerciseId);
            const totalReps = sets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
            const totalDur = sets.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);
            await workoutExerciseRepository.update(ex.workoutExerciseId, {
                totalReps,
                totalDurationSeconds: totalDur,
            });
        }

        const endedAt = Date.now();
        const totalTimeSeconds = Math.max(0, Math.round((endedAt - (state.startedAt ?? endedAt)) / 1000));
        await workoutRepository.update(state.workoutId, {
            endedAt,
            totalTimeSeconds,
            completed: 1,
            notes,
        });

        const { timerHandle } = state;
        if (timerHandle) clearInterval(timerHandle);
        set({ status: 'idle', endedAt, timerHandle: undefined });
        return state.workoutId;
    },

    reset: () => {
        const { timerHandle } = get();
        if (timerHandle) clearInterval(timerHandle);
        set({
            sessionId: undefined,
            workoutId: undefined,
            startedAt: undefined,
            endedAt: undefined,
            elapsedSeconds: 0,
            restRemainingSeconds: null,
            status: 'idle',
            timerHandle: undefined,
            exercises: [],
            currentExerciseIndex: 0,
            mode: 'DEFAULT',
            hiitWorkSeconds: null,
            hiitRestSeconds: null,
            hiitTotalDurationSeconds: null,
            hiitTotalRemainingSeconds: null,
            phase: undefined,
            phaseRemainingSeconds: null,
            amrapTotalRemainingSeconds: null,
            emomIntervalSeconds: null,
            emomRemainingSeconds: null,
        });
    },
}));
