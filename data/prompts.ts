// Prompts data for the Anti-Boredom Engine
// Replace or expand these as needed!

export interface Prompt {
    id: string;
    text: string;
    category: 'questions' | 'missions' | 'truthdare';
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
];

export const categories = [
    { id: 'questions', label: 'Questions', emoji: '💬', color: 'bg-portal-pink' },
    { id: 'missions', label: 'Missions', emoji: '🎯', color: 'bg-portal-sky' },
    { id: 'truthdare', label: 'Truth/Dare', emoji: '🎲', color: 'bg-portal-purple' },
] as const;

export type CategoryId = typeof categories[number]['id'];
