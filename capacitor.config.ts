import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.purohitsetu.app',
  appName: 'PurohitSetu',
  webDir: 'public',
  server: {
    url: 'http://192.168.1.5:3000/pandit/dashboard',
    cleartext: true
  }
};

export default config;