import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prerna.expensiq',
  appName: 'ExpensIQ',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
