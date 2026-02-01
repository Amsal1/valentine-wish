# 💕 Valentine Love Website

A beautiful, personalized Valentine's Day website to express your love. Features an interactive photo gallery, heartfelt reasons section, and a playful "Do You Love Me?" game with an evasive No button!

## ✨ Features

- **Hero Section** - Romantic welcome with floating hearts animation
- **Reasons I Love You** - Flip cards revealing heartfelt messages
- **Photo Gallery** - Click-to-reveal gallery for your special photos
- **Featured Memory** - Showcase a special photo prominently
- **Love Game** - Fun "Do You Love Me?" game where the No button runs away!
- **Fully Responsive** - Works beautifully on mobile, tablet, and desktop
- **Accessibility** - Respects reduced motion preferences
- **Easy Customization** - All text configurable from a single file

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher) or [Bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd valentine-love-website

# Install dependencies
npm install
# or with bun
bun install
```

### Development

```bash
# Start development server
npm run dev
# or with bun
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the project
npm run build
# or with bun
bun run build
```

The built files will be in the `dist/` folder.

## 🎨 Customization

### Personalizing the Website

All personalization is done in `src/config.ts`. Open this file and modify the constants at the top:

```typescript
// Change these to customize for your love!
const PARTNER_NAME = 'Partner_Name';      // Your partner's name
const YOUR_NAME = 'Amsal';          // Your name
const SURNAME = 'Khan';             // Shared surname (optional)
const PET_NAMES = ['Madam-ji', 'Maalkin'];  // Pet names/nicknames
```

### Customizing Sections

Each section can be customized in the `siteConfig` object:

#### Hero Section
```typescript
hero: {
  title: `For My ${PARTNER_NAME} 💕`,
  subtitle: 'Your romantic message here',
  ctaText: 'See Why I Love You',
},
```

#### Reasons Cards
```typescript
reasons: {
  sectionTitle: `Why I Love You, ${PARTNER_NAME}`,
  cards: [
    { 
      id: '1', 
      text: 'Card title', 
      icon: '😊',
      description: 'Your heartfelt message'
    },
    // Add more cards...
  ],
},
```

#### Gallery Section
```typescript
gallery: {
  sectionTitle: `Some Lovely Pics of ${PARTNER_NAME}`,
  sectionSubtitle: 'Tap to reveal the moments I adore 💕',
},
```

#### Love Game
```typescript
loveGame: {
  sectionTitle: 'One Last Question...',
  question: `Will you be mine forever, ${PARTNER_NAME}?`,
  yesButtonText: 'Yes! 💕',
  noButtonText: 'No',
  celebrationTitle: 'Yayyyy! 💕🎉',
  celebrationSubtitle: 'Your celebration message',
  pleadingMessages: [
    'Please? 🥺',
    'Pretty please? 💕',
    // Add more pleading messages...
  ],
},
```

## 📸 Adding Photos

### Gallery Photos

Place your photos in the `public/photos/` folder:

```
public/
  photos/
    photo1.jpg
    photo2.jpg
    photo3.jpg
    ...
```

The gallery automatically loads photos named `photo1.jpg`, `photo2.jpg`, etc.

### Featured Memory Photo

For the special featured photo section, add your photo as:
```
public/photos/us-together.jpg
```

To customize the featured section text, edit `index.html`:
```html
<section id="featured-memory" class="section featured-memory-section">
  <h2 class="section-title">A Rare Memory 📸</h2>
  <p class="section-subtitle">Your caption here 💕</p>
  ...
  <p class="featured-photo-caption">8 years and counting... 💕</p>
</section>
```

## 🌐 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Create a new Static Site on [Render](https://render.com)
3. Connect your repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variable: `NODE_VERSION=20`

### Deploy to Vercel

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. It will auto-detect Vite and configure everything

### Deploy to Netlify

1. Push your code to GitHub
2. Create new site on [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## 🧪 Running Tests

```bash
# Run tests once
npm run test:run
# or with bun
bun run test:run

# Run tests in watch mode
npm run test
```

## 📁 Project Structure

```
valentine-love-website/
├── public/
│   ├── photos/           # Your photos go here
│   │   ├── photo1.jpg
│   │   ├── us-together.jpg
│   │   └── ...
│   └── heart.svg
├── src/
│   ├── config.ts         # ⭐ Main customization file
│   ├── main.ts           # Application entry point
│   ├── style.css         # All styles
│   ├── modules/          # Feature modules
│   │   ├── animations.ts
│   │   ├── gallery.ts
│   │   ├── hero.ts
│   │   ├── love-game.ts
│   │   ├── navigation.ts
│   │   └── reasons.ts
│   └── utils/            # Utility functions
├── index.html            # Main HTML file
├── package.json
├── vite.config.ts
└── README.md
```

## 💡 Tips

1. **Photo Optimization**: Compress your photos before adding them for faster loading
2. **Mobile Testing**: Test on actual mobile devices for the best experience
3. **Personal Touch**: Add your own pleading messages in Hinglish or your language!
4. **Reduced Motion**: The site respects `prefers-reduced-motion` for accessibility

## 🤝 Contributing

Feel free to fork this project and customize it for your own Valentine!

## 📄 License

MIT License - Feel free to use this for your loved one! 💕

---

Made with ❤️ for all the lovers out there
