// Simple test for FSMGraph implementation
import { FSMGraph } from './fsm.js';

// Define types for a simple traffic light FSM
type TrafficLightContext = {
    timer: number;
    pedestrianWaiting: boolean;
};

type TrafficLightEvent = { type: 'timer_expired' } | { type: 'pedestrian_button' };

// Create FSM configuration
const trafficLightFSM = new FSMGraph<TrafficLightContext, TrafficLightEvent>({
    initialState: 'red',
    finalStates: [],
    context: { timer: 0, pedestrianWaiting: false },
    hierarchical: false,
});

// Add states
trafficLightFSM
    .addState('red', {
        entryActions: [
            (context) => {
                console.log('🔴 Red light - pedestrians can cross');
                return { ...context, timer: 30 };
            },
        ],
    })
    .addState('yellow', {
        entryActions: [
            (context) => {
                console.log('🟡 Yellow light - prepare to stop');
                return { ...context, timer: 5 };
            },
        ],
    })
    .addState('green', {
        entryActions: [
            (context) => {
                console.log('🟢 Green light - vehicles can go');
                return { ...context, timer: 60 };
            },
        ],
    });

// Add transitions
trafficLightFSM
    .addTransition({
        from: 'red',
        to: 'green',
        event: 'timer_expired',
        guard: (context) => context.timer <= 0,
        reducer: (context) => ({ ...context, pedestrianWaiting: false }),
    })
    .addTransition({
        from: 'green',
        to: 'yellow',
        event: 'timer_expired',
        guard: (context) => context.timer <= 0,
    })
    .addTransition({
        from: 'yellow',
        to: 'red',
        event: 'timer_expired',
        guard: (context) => context.timer <= 0,
    })
    .addTransition({
        from: 'green',
        to: 'yellow',
        event: 'pedestrian_button',
        guard: (context) => context.pedestrianWaiting,
        priority: 10, // Higher priority than timer expiration
    });

// Debug: Check if transitions were added
console.log('\nAll edges in graph:');
for (const edge of trafficLightFSM.edges()) {
    if (Array.isArray(edge.data)) {
        console.log(`Edge: ${edge.u} -> ${edge.v}, events: [${edge.data.map(t => t.event).join(', ')}]`);
    } else {
        console.log(`Edge: ${edge.u} -> ${edge.v}, event: ${edge.data?.event}`);
    }
}

// Test the FSM
console.log('🚦 Testing Traffic Light FSM');
console.log('Initial state:', trafficLightFSM.getCurrentState());
console.log('Initial context:', trafficLightFSM.getContext());

// Simulate timer countdown
let context = trafficLightFSM.getContext();
for (let i = context.timer; i >= 0; i--) {
    trafficLightFSM.setContext({ ...context, timer: i });
}

// Try to transition from red to green
const result1 = trafficLightFSM.transition({ type: 'timer_expired' });
console.log('\nTransition result:', result1);
console.log('Current state:', trafficLightFSM.getCurrentState());

// Simulate pedestrian pressing button
trafficLightFSM.updateContext((ctx) => ({ ...ctx, pedestrianWaiting: true }));
const result2 = trafficLightFSM.transition({ type: 'pedestrian_button' });
console.log('\nPedestrian button result:', result2);
console.log('Current state:', trafficLightFSM.getCurrentState());

// Validate the FSM
const validation = trafficLightFSM.validate();
console.log('\nFSM Validation:', validation);

console.log('\n✅ FSMGraph test completed successfully!');