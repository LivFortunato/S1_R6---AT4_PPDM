import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent chama o AppRegistry.registerComponent('main', () => App)
// e garante que o app funcione tanto no Expo Go quanto em um build nativo.
registerRootComponent(App);