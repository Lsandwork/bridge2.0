export type StressReliefActivity = {
  id: string;
  category: string;
  title: string;
  pointsAwarded: 20;
  source: "approved_nuvio_pet_stress_relief_library";
};

const source = "approved_nuvio_pet_stress_relief_library" as const;

const groups: Record<string, string[]> = {
  "Quick Reset": [
    "Take 10 deep breaths", "Drink a glass of water", "Stretch for 2 minutes", "Step outside for fresh air",
    "Listen to your favorite song", "Watch a funny animal video", "Look out the window", "Pet your dog or cat",
    "Close your eyes for one minute", "Write one positive thought", "Smile at yourself in a mirror",
    "Practice grounding (5-4-3-2-1)", "Roll your shoulders", "Take a slow walk around the house", "Unclench your jaw",
  ],
  Relaxation: [
    "Take a warm bath", "Take a hot shower", "Light a candle", "Use essential oils", "Drink herbal tea",
    "Listen to calming music", "Listen to rain sounds", "Try a guided meditation", "Practice mindfulness",
    "Sit quietly for 10 minutes", "Use a weighted blanket", "Read a relaxing book", "Watch a fireplace video",
    "Do gentle yoga", "Stretch your entire body",
  ],
  "Physical Activity": [
    "Walk around the block", "Walk your dog", "Dance to one song", "Ride your bike", "Go hiking", "Swim",
    "Play pickleball", "Shoot basketball", "Practice golf putting", "Do jumping jacks", "Go to the gym",
    "Stretch your legs", "Practice balance exercises", "Follow a home workout", "Take a scenic walk",
  ],
  "Creative Activities": [
    "Draw", "Paint", "Color", "Journal", "Write a poem", "Start a scrapbook", "Photography walk",
    "Build with LEGO", "Knit", "Crochet", "Learn calligraphy", "Fold origami", "Create a vision board",
    "Make digital art", "Solve a puzzle",
  ],
  Entertainment: [
    "Watch a comedy", "Watch funny videos", "Listen to a podcast", "Read a book", "Listen to an audiobook",
    "Watch a documentary", "Watch your favorite movie", "Explore YouTube", "Listen to relaxing playlists",
    "Learn something new online",
  ],
  Games: [
    "Play Wordle", "Sudoku", "Crossword puzzle", "Chess", "Uno", "Solitaire", "Card games",
    "Nintendo Switch", "Puzzle games", "Trivia games", "Escape room games", "Memory games", "Jigsaw puzzle",
  ],
  "Social Connection": [
    "Call a friend", "Text someone you love", "Have coffee with someone", "Visit family", "Video chat a friend",
    "Write a thank-you note", "Join a support group", "Attend a community event", "Invite someone for lunch",
    "Share a funny meme",
  ],
  "Family Activities": [
    "Family movie night", "Build a fort", "Backyard picnic", "Play board games", "Family walk",
    "Bake cookies together", "Make pizza together", "Family dance party", "Scavenger hunt", "Water balloon fight",
    "Read together", "Family karaoke", "Craft project", "Backyard camping", "Visit a playground",
  ],
  "Outdoor Activities": [
    "Visit the beach", "Go to a park", "Watch the sunset", "Watch the sunrise", "Stargaze",
    "Visit a botanical garden", "Bird watching", "Visit a lake", "Farmers market", "Nature photography",
    "Picnic", "Explore a new trail", "Feed ducks where permitted", "Outdoor yoga", "Sit under a tree",
  ],
  "Food & Cooking": [
    "Bake cookies", "Bake bread", "Cook a new recipe", "Make smoothies", "Try a new restaurant",
    "Visit a coffee shop", "Ice cream outing", "Family barbecue", "Meal prep", "Homemade pizza night",
    "Chocolate tasting", "Decorate cupcakes",
  ],
  "Self Care": [
    "Face mask", "Skin care routine", "Get a massage", "Foot soak", "Paint your nails", "Hair treatment",
    "Organize your room", "Declutter one drawer", "Buy fresh flowers", "Change your bedsheets",
    "Wear comfortable clothes", "Read affirmations", "Practice gratitude", "Digital detox", "Nap for 20 minutes",
  ],
  "Personal Growth": [
    "Learn a language", "Take an online class", "Listen to TED Talks", "Practice typing",
    "Read educational articles", "Learn an instrument", "Learn a new hobby", "Practice photography",
    "Set weekly goals", "Review accomplishments", "Plan tomorrow", "Learn a magic trick",
  ],
  "Mood Boosters": [
    "Tell yourself three positive things", "Celebrate a small win", "Watch bloopers",
    "Dance like nobody is watching", "Hug someone", "Hug a pet", "Look through happy photos",
    "Laugh for one minute", "Listen to motivational music", "Read inspirational quotes",
  ],
  "Couple Time": [
    "Coffee date", "Dinner date", "Movie night", "Evening walk", "Cook together", "Watch the sunset",
    "Ice cream date", "Board game night", "Mini road trip", "Home spa night",
  ],
  Community: [
    "Volunteer", "Donate unused items", "Help a neighbor", "Join a local event", "Attend a workshop",
    "Visit a library", "Explore a museum", "Visit a local festival", "Attend a farmers market",
    "Participate in a charity walk",
  ],
  "Nuvio AI Activities": [
    "2-minute breathing exercise", "Guided mindfulness session", "Positive affirmation", "Gratitude prompt",
    "Journal prompt", "Daily reflection", "Mood check-in", "Stress assessment", "Relaxation timer",
    "Hydration reminder", "Stretch reminder", "Walking reminder", "Self-care reminder", "Random act of kindness",
    "Daily challenge", "Family challenge", "Calm challenge", "Confidence challenge", "Happiness challenge",
    "Goal reminder", "Motivation boost", "Encouragement message", "Celebrate today's progress",
    "Unlock achievement badge", "Spin the Daily Reset Wheel", "Earn Bridge Points", "Open a Mystery Reward",
    "AI-recommended activity",
  ],
};

function idFor(category: string, title: string) {
  return `${category}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const stressReliefActivities: StressReliefActivity[] = Object.entries(groups).flatMap(([category, titles]) =>
  titles.map((title) => ({
    id: idFor(category, title),
    category,
    title,
    pointsAwarded: 20,
    source,
  }))
);

export function pickStressReliefActivity(seed = Date.now()): StressReliefActivity {
  return stressReliefActivities[Math.abs(seed) % stressReliefActivities.length] ?? stressReliefActivities[0];
}
