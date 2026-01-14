import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Set up favicon for web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const faviconAsset = require('./assets/favicon.png');
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  // On web, Metro returns the asset URI directly or as an object with uri property
  link.href = typeof faviconAsset === 'string' ? faviconAsset : (faviconAsset.uri || faviconAsset.default || '/assets/assets/favicon.png');
  document.head.appendChild(link);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
