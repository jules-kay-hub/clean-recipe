# Technology Stack

## Languages

### Primary
- **TypeScript** (v5.3.0) - Used throughout both frontend and backend
  - Strict mode enabled via `tsconfig.json`
  - Extends `expo/tsconfig.base`

### Secondary
- **JavaScript** - Configuration files (Babel, Metro)

## Runtime & Package Manager

- **Node.js** - Server-side runtime for Convex backend
- **React Native** (v0.81.5) - Mobile runtime via Expo
- **npm** - Package manager (evidenced by `package.json`)

## Frameworks

### Core
| Framework | Version | Purpose |
|-----------|---------|---------|
| **Expo** | v54.0.31 | React Native development platform |
| **React** | v19.1.0 | UI component library |
| **React Native** | v0.81.5 | Mobile app framework |
| **Convex** | v1.17.0 | Serverless backend with real-time sync |
| **React Navigation** | v6.x | Navigation (bottom tabs + native stack) |

### Build & Tooling
| Tool | Version | Purpose |
|------|---------|---------|
| **Babel** | v7.20.0 | JavaScript transpilation |
| **TypeScript** | v5.3.0 | Type checking |
| **ESLint** | v9.39.2 | Code linting (flat config) |
| **Metro** | (bundled) | React Native bundler |
| **babel-plugin-module-resolver** | v5.0.0 | Path alias resolution |

## Key Dependencies

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-font` | v14.0.10 | Custom font loading |
| `expo-haptics` | v15.0.8 | Haptic feedback |
| `expo-image` | v3.0.11 | Optimized image component |
| `expo-sqlite` | v16.0.10 | Local SQLite for offline caching |
| `expo-keep-awake` | (implied) | Screen wake lock for cooking mode |
| `react-native-safe-area-context` | v5.6.0 | Safe area handling |
| `react-native-screens` | v4.16.0 | Native screen optimization |
| `react-native-svg` | v15.15.1 | SVG rendering |
| `lucide-react-native` | v0.562.0 | Icon library |
| `@react-native-community/netinfo` | v11.4.1 | Network connectivity detection |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| `convex` | v1.17.0 | Database, serverless functions, real-time |
| `@anthropic-ai/sdk` | v0.71.2 | Claude AI for recipe extraction |

### Fonts
- `@expo-google-fonts/inter` (v0.4.2) - Primary UI font
- `@expo-google-fonts/fraunces` (v0.4.1) - Display/accent font

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@typescript-eslint/eslint-plugin` | v8.53.0 | TypeScript linting |
| `eslint-plugin-react` | v7.37.5 | React-specific linting |
| `eslint-plugin-react-hooks` | v7.0.1 | Hooks rules enforcement |
| `eslint-plugin-react-native` | v5.0.0 | RN-specific rules |
| `sharp` | v0.34.5 | Image processing |

## Configuration

### Path Aliases
Configured in `babel.config.js` and `tsconfig.json`:
```
@/*           -> src/*
@components/* -> src/components/*
@screens/*    -> src/screens/*
@hooks/*      -> src/hooks/*
@styles/*     -> src/styles/*
```

### Key Config Files
| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compiler options |
| `babel.config.js` | Babel presets and module resolver |
| `eslint.config.mjs` | ESLint flat config (v9+) |
| `app.json` | Expo application configuration |
| `.env.local` | Environment variables (Convex URL) |

### ESLint Configuration
- Uses ESLint v9 flat config format
- TypeScript + React + React Hooks + React Native plugins
- Ignores: `node_modules`, `.expo`, `dist`, `convex/_generated`

## Platform Requirements

### Mobile Platforms
| Platform | Configuration |
|----------|---------------|
| **iOS** | Bundle ID: `com.yourname.julienned`, supports tablets |
| **Android** | Package: `com.yourname.julienned`, INTERNET permission |
| **Web** | Metro bundler, react-native-web support |

### App Configuration (`app.json`)
- **Name**: Julienned
- **Slug**: julienned
- **Orientation**: Portrait only
- **User Interface Style**: Automatic (light/dark)
- **Deep Linking Scheme**: `julienned://`
- **Plugins**: expo-font, expo-sqlite

### Background Capabilities
- iOS: Background fetch enabled (`UIBackgroundModes: ["fetch"]`)
