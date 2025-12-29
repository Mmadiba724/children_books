export interface Book {
    id: string;
    title: string;
    author: string;
    priceCents: number; // price in cents to avoid floating math
    coverUrl: string; // local path or remote URL
    description: string;
    previewPages: string[]; // short text excerpts or image URLs
    ageRange?: string;
    categories?: string[];
}

// Local cover images — import so Vite can bundle them
import coverBunny from "../assets/Book covers/1 frt.jpg";
import coverStella from "../assets/Book covers/2frt.jpg";
import coverChef from "../assets/Book covers/3frt.jpg";
import coverForest from "../assets/Book covers/4frt.jpg";
import coverMilo from "../assets/Book covers/5frt.jpg";
import coverRainbow from "../assets/Book covers/15frt.jpg";

// Additional covers for expanded catalog
import coverSix from "../assets/Book covers/6frt.jpg";
import coverSeven from "../assets/Book covers/7frt.jpg";
import coverEight from "../assets/Book covers/8frt.jpg";
import coverNine from "../assets/Book covers/9frt (1).jpg";
import coverTen from "../assets/Book covers/10frt.jpg";
import coverEleven from "../assets/Book covers/11frt.jpg";

export const books: Book[] = [
    {
        id: "bunny-adventure",
        title: "The Great Bunny Adventure",
        author: "Lila Meadows",
        priceCents: 799,
        coverUrl: coverBunny,
        description:
            "Benny the bunny wants to find the rainbow meadow. Join him as he hops, meets friends, and learns about sharing and courage.",
        previewPages: [
            "Benny woke up early and stretched his long ears. Today felt like a special day—there was a glitter of dew and the sky smelled like peaches.",
            "He met a little turtle who whispered a secret map: 'Follow the sunflowers, and you will find the rainbow meadow.'"
        ],
        ageRange: "3-6",
        categories: ["Animals", "Adventure"]
    },
    {
        id: "stella-stargazer",
        title: "Stella Stargazer",
        author: "Marcos Luna",
        priceCents: 1299,
        coverUrl: coverStella,
        description:
            "Stella loves the stars and wants to touch them. A gentle bedtime tale about curiosity, dreams, and the wonder of the night sky.",
        previewPages: [
            "Stella counted the stars until her eyes felt like sleepy marbles. 'One, two, three...' she whispered until she drifted into a dream.",
            "In her dream the stars turned into friendly fireflies who taught Stella how to say hello to the moon."
        ],
        ageRange: "4-8",
        categories: ["Bedtime", "STEM"]
    },
    {
        id: "little-chef",
        title: "The Little Chef Club",
        author: "Aya Tan",
        priceCents: 999,
        coverUrl: coverChef,
        description:
            "A playful story about a group of friends who start a mini kitchen and learn about teamwork, measurements, and yummy surprises.",
        previewPages: [
            "First we wash our hands—sing the scrubbing song! Then we measure cups of flour and sprinkle them like clouds.",
            "When the cookies rise, the friends cheer. 'We did it together!' they shout, and the kitchen smells like warm hugs."
        ],
        ageRange: "3-7",
        categories: ["Cooking", "Friendship"]
    },
    {
        id: "forest-music",
        title: "Forest Music Festival",
        author: "Noah Rivera",
        priceCents: 1099,
        coverUrl: coverForest,
        description:
            "Animals in the forest plan a music festival. This rhythmic story introduces instruments and sounds in a lyrical, singable format.",
        previewPages: [
            "Tap, tap, went the little drum—boom! Boom! The fox strummed stringy vines for a gentle hum.",
            "The owls hooted, the frogs croaked, and soon the whole forest had its very own band."
        ],
        ageRange: "3-6",
        categories: ["Music", "Rhythm"]
    },
    {
        id: "milo-moonboat",
        title: "Milo and the Moonboat",
        author: "Sofia Armand",
        priceCents: 1499,
        coverUrl: coverMilo,
        description:
            "Milo builds a tiny boat to sail to the moon. A gentle, imaginative tale about invention, patience, and big dreams.",
        previewPages: [
            "Milo's pockets were full of buttons and twine. He tightened, hammered, and hummed until a little boat stood proud.",
            "At night Milo watched the moon and imagined their next trip: 'Don't worry, Moon, I'll visit soon,' he whispered."
        ],
        ageRange: "5-9",
        categories: ["Imagination", "STEM"]
    },
    {
        id: "rainbow-garden",
        title: "The Rainbow Garden",
        author: "Priya Desai",
        priceCents: 699,
        coverUrl: coverRainbow,
        description:
            "Colors come alive in this short, cheerful book perfect for very young readers. Learn colors, shapes, and friendly insects.",
        previewPages: [
            "Red ladybug hopped on a leaf. 'Hello!' said Yellow bee as it buzzed by.",
            "Blue splash in the puddle—splash! The flowers make happy faces in the sun."
        ],
        ageRange: "1-4",
        categories: ["Colors", "First Words"]
    },
    {
        id: "star-baker",
        title: "The Star Baker",
        author: "Amir Patel",
        priceCents: 1099,
        coverUrl: coverSix,
        description:
            "Luna loves to bake star-shaped cookies for the neighborhood. A warm story about sharing and trying new recipes.",
        previewPages: [
            "Luna mixed sugar and spice and sprinkled moons on top.",
            "Her friends came by, clapped, and tasted the stars—each bite a little cheer."
        ],
        ageRange: "3-7",
        categories: ["Cooking", "Friendship"]
    },
    {
        id: "luna-kite",
        title: "Luna and the Kite",
        author: "Hiro Tanaka",
        priceCents: 899,
        coverUrl: coverSeven,
        description:
            "A breezy tale about a kite that carries little Luna on a skyward adventure. Gentle, imaginative, and perfect for windy days.",
        previewPages: [
            "The kite tugged, and Luna giggled as they chased the clouds together.",
            "They sailed over rooftops and learned that sometimes the wind takes you where you need to go."
        ],
        ageRange: "2-5",
        categories: ["Adventure", "Imagination"]
    },
    {
        id: "cloud-car",
        title: "The Cloud Car",
        author: "Maya Singh",
        priceCents: 1199,
        coverUrl: coverEight,
        description:
            "A whimsical ride through cotton-candy skies that teaches curiosity and kindness along the way.",
        previewPages: [
            "Engine purrs like a sleepy kitten, and the cloud car lifts gently off the hills.",
            "The driver pointed at a sky-lighthouse and said, 'For dreams, follow the twinkle.'"
        ],
        ageRange: "4-8",
        categories: ["Imagination", "Adventure"]
    },
    {
        id: "ocean-nap",
        title: "The Ocean Nap",
        author: "Zoe Park",
        priceCents: 999,
        coverUrl: coverNine,
        description:
            "A soothing seaside story where waves hum a sleepy song and friends learn about rest and the rhythm of the sea.",
        previewPages: [
            "Waves rocked the little boat like a lullaby, and the gulls kept watch.",
            "Even the smallest pebble felt the calm and sighed—sleep came easy."
        ],
        ageRange: "1-4",
        categories: ["Bedtime", "Nature"]
    },
    {
        id: "counting-cupcakes",
        title: "Counting Cupcakes",
        author: "Diego Morales",
        priceCents: 699,
        coverUrl: coverTen,
        description:
            "A bright counting book wrapped in sugary fun — perfect for learning numbers with tasty treats.",
        previewPages: [
            "One cupcake, two cupcake, three—sprinkles like tiny stars.",
            "They counted and shared until only crumbs were left and laughter filled the room."
        ],
        ageRange: "1-4",
        categories: ["Early Learning", "Counting"]
    },
    {
        id: "brave-bike",
        title: "The Brave Little Bike",
        author: "Hannah Lee",
        priceCents: 1299,
        coverUrl: coverEleven,
        description:
            "A story about a small bike learning to ride without training wheels—the perfect mix of wobbles and triumphs.",
        previewPages: [
            "Pedal, wobble, pedal—tiny hands tightened the handlebars.",
            "The first brave circle around the park felt bigger than the whole wide world."
        ],
        ageRange: "3-6",
        categories: ["Growth", "Courage"]
    }
];

export function getBookById(id: string): Book | undefined {
    return books.find((b) => b.id === id);
}
