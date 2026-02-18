# Children's Books E-Commerce Platform

A modern, full-featured e-commerce platform for children's books built with React, TypeScript, and Vite. Features a complete shopping experience with cart management, secure checkout, user authentication, and administrative tools.

## 🌟 Features

### Customer Features

- **Browse & Search**: Explore books catalog with category filtering and search functionality
- **Book Details**: View comprehensive book information, reviews, and ratings
- **Shopping Cart**: Add books to cart with persistent storage
- **Secure Checkout**: Complete purchase with payment integration
- **User Authentication**: JWT-based authentication with token refresh
- **Personal Library**: Access purchased books with read and download options
- **Order History**: View past orders with date filtering
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

### Admin Features

- **Book Management**: Add, edit, and manage book listings with cover uploads
- **Category Management**: Create and organize book categories
- **Order Management**: Review and process pending orders
- **Dashboard**: Centralized admin panel for all management tasks

## 🚀 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 4.x
- **Routing**: React Router 7.x
- **State Management**: React Context API (Auth & Cart)
- **HTTP Client**: Axios with request/response interceptors
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Form Handling**: Native React forms with validation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── BookCard.tsx
│   ├── CartSidebar.tsx
│   └── ...
├── pages/              # Page components
│   ├── CatalogPage.tsx
│   ├── BookDetailPage.tsx
│   ├── CheckoutPage.tsx
│   ├── LibraryPage.tsx
│   ├── MyOrdersPage.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── services/           # API service modules
│   ├── authService.ts
│   ├── bookService.ts
│   ├── cartService.ts
│   ├── orderService.ts
│   └── ...
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── config/             # Configuration files
│   └── api.ts         # Axios instance & interceptors
├── utils/              # Utility functions
│   ├── tokenStorage.ts
│   ├── errorHandler.ts
│   └── ...
└── types/              # TypeScript type definitions
    ├── book.ts
    └── user.ts
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mmadiba724/children_books.git
   cd children_books
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)

   The API base URL is configured in `src/config/api.ts`:

   ```typescript
   const API_BASE_URL = 'https://dev.ebook.api.toughblue.com';
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm run deploy` - Deploy to GitHub Pages

## 🔐 Authentication Flow

The application uses JWT-based authentication with the following features:

- **Token Management**: Access tokens stored in memory, refresh tokens in sessionStorage
- **Auto-refresh**: Tokens automatically refresh on app initialization and 401/403 errors
- **Protected Routes**: Certain pages require authentication (Library, Orders, Admin)
- **Concurrent Request Handling**: Prevents duplicate token refresh requests

### Token Storage Strategy

- **Access Token**: In-memory storage (lost on page refresh, then automatically refreshed)
- **Refresh Token**: SessionStorage (7-day expiry, persists during browser session)

## 🌐 API Integration

The application communicates with a RESTful API at `https://dev.ebook.api.toughblue.com`

### Key Endpoints

- `/api/v1/auth/*` - Authentication (login, register, refresh)
- `/api/v1/books/*` - Book catalog and details
- `/api/v1/cart/*` - Shopping cart operations
- `/api/v1/orders/*` - Order management
- `/api/v1/library/*` - User's purchased books
- `/api/v1/categories/*` - Book categories
- `/api/v1/admin/*` - Admin operations

### Request Interceptors

- Automatically attaches JWT access token to authenticated requests
- Handles token refresh on 401/403 responses
- Provides consistent error handling

## 🎨 Styling

The project uses Tailwind CSS with a custom color scheme:

- **Primary Color**: Rose (pink tones)
- **Background**: Light rose (`rose-50`)
- **Component Library**: Custom components with Tailwind classes

## 🚢 Deployment

### GitHub Pages

1. **Update homepage in package.json**

   ```json
   "homepage": "https://YOUR-USERNAME.github.io/children_books"
   ```

2. **Deploy**

   ```bash
   npm run deploy
   ```

### Other Platforms

The build output in `dist/` folder can be deployed to:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 🧪 Development Notes

### Environment Variables

Currently, the API base URL is hardcoded. For production, consider using environment variables:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dev.ebook.api.toughblue.com';
```

### ESLint Configuration

The project uses TypeScript ESLint with React-specific rules. Extend the configuration in `.eslintrc.cjs` for stricter type checking:

```js
export default {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

## 📦 Key Dependencies

- **react**: ^18.2.0 - UI library
- **react-router-dom**: ^7.9.6 - Client-side routing
- **axios**: ^1.13.4 - HTTP client
- **tailwindcss**: ^4.1.17 - Utility-first CSS
- **lucide-react**: ^0.555.0 - Icon library
- **react-hot-toast**: ^2.6.0 - Toast notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- [Mmadiba724](https://github.com/Mmadiba724)

## 🐛 Known Issues

- Session persistence: Refresh tokens stored in sessionStorage are cleared when browser is closed
- React StrictMode: Double-render in development may cause duplicate API calls (handled with concurrent request protection)

## 🔮 Future Enhancements

- [ ] User profile editing
- [ ] Wishlist functionality
- [ ] Book reviews and ratings submission
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Book recommendations
- [ ] Multi-language support
