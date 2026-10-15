import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.purohitsetu.pandit',
  appName: 'PurohitSetu Pandit',
  webDir: 'public',
  server: {
    url: 'https://www.purohitsetu.in/pandit/login',
    cleartext: true
  }
};

export default config;