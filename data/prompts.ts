// Prompts data for the Anti-Boredom Engine
// Replace or expand these as needed!

export interface Prompt {
    id: string;
    text: string;
    category: 'questions' | 'missions' | 'truthdare' | 'flirty' | 'what_if' | 'would_you_rather' | 'daily_fact';
}

export const prompts: Prompt[] = [
    // Questions
    { id: 'q1', text: 'What is your favorite memory of us? 💭', category: 'questions' },
    { id: 'q2', text: 'If we could teleport anywhere right now, where? ✈️', category: 'questions' },
    { id: 'q3', text: 'What food do you want to eat with me? 🍕', category: 'questions' },
    { id: 'q4', text: 'What is the first thing we will do when we meet? 🫂', category: 'questions' },
    { id: 'q5', text: 'Which movie character is most like me? 🎥', category: 'questions' },

    // Missions
    { id: 'm1', text: 'Make a heart shape with your hands and send a photo! 🫶', category: 'missions' },
    { id: 'm2', text: 'Send a voice note singing a random song. 🎤', category: 'missions' },
    { id: 'm3', text: 'Find something blue in your room and show me. 🔵', category: 'missions' },
    { id: 'm4', text: 'Draw a picture of me in 10 seconds (use the Draw app!). 🎨', category: 'missions' },
    { id: 'm5', text: 'Send a selfie making a funny face. 🤪', category: 'missions' },

    // Truth/Dare
    { id: 't1', text: 'Truth: What is one secret you haven\'t told me? 🤫', category: 'truthdare' },
    { id: 't2', text: 'Truth: What was your first impression of me? 👀', category: 'truthdare' },
    { id: 't3', text: 'Dare: Do 5 jumping jacks on video call. 🏃‍♀️', category: 'truthdare' },
    { id: 't4', text: 'Dare: Talk in a whisper for the next 2 minutes. 🤫', category: 'truthdare' },
    { id: 't5', text: 'Dare: Let me choose your profile picture for 1 hour. 🖼️', category: 'truthdare' },

    // Flirty
    { id: 'f1', text: 'Stop being so cute, I\'m trying to concentrate! 😤', category: 'flirty' },
    { id: 'f2', text: 'I bet I can make you smile in 3 seconds. Ready? ⏱️', category: 'flirty' },
    { id: 'f3', text: 'You + Me + Pizza = ? 🍕', category: 'flirty' },
    { id: 'f4', text: 'Send me your best wink right now! 😉', category: 'flirty' },
    { id: 'f5', text: 'If kisses were snowflakes, I\'d send you a blizzard. ❄️', category: 'flirty' },

    // What If
    { id: 'wi1', text: 'What if we were both cats? What would our names be? 🐱', category: 'what_if' },
    { id: 'wi2', text: 'What if we won the lottery today? First thing we buy? 💰', category: 'what_if' },
    { id: 'wi3', text: 'What if we could only eat one color of food for a week? 🥦', category: 'what_if' },
    { id: 'wi4', text: 'What if we lived on the moon? 🌕', category: 'what_if' },

    // Would You Rather
    { id: 'wur1', text: 'Would you rather: Only be able to whisper OR only be able to shout? 🗣️', category: 'would_you_rather' },
    { id: 'wur2', text: 'Would you rather: Have a pet dinosaur OR a pet dragon? 🦖', category: 'would_you_rather' },
    { id: 'wur3', text: 'Would you rather: Never have to sleep OR never have to eat? 😴', category: 'would_you_rather' },
    { id: 'wur4', text: 'Would you rather: Be invisible OR be able to fly? 🧚‍♀️', category: 'would_you_rather' },

    // Daily Fact
    { id: 'df1', text: 'Did you know sea otters hold hands when they sleep so they don’t drift apart? 🦦', category: 'daily_fact' },
    { id: 'df2', text: 'Penguins propose to their lifemates with a pebble. 🐧', category: 'daily_fact' },
    { id: 'df3', text: 'The heart of a shrimp is located in its head! 🦐', category: 'daily_fact' },
    { id: 'df4', text: 'Cows have best friends and get stressed when they are separated. 🐮', category: 'daily_fact' },
];

export const categories = [
    { id: 'questions', label: 'Questions', emoji: '💬', color: 'bg-portal-pink' },
    { id: 'missions', label: 'Missions', emoji: '🎯', color: 'bg-portal-sky' },
    { id: 'truthdare', label: 'Truth/Dare', emoji: '🎲', color: 'bg-portal-purple' },
    { id: 'flirty', label: 'Flirty', emoji: '😘', color: 'bg-rose-200' },
    { id: 'what_if', label: 'What If?', emoji: '🤔', color: 'bg-teal-200' },
    { id: 'would_you_rather', label: 'Would You Rather', emoji: '⚖️', color: 'bg-orange-200' },
    { id: 'daily_fact', label: 'Fact Drop', emoji: '🧠', color: 'bg-indigo-200' },
] as const;

export type CategoryId = typeof categories[number]['id'];
