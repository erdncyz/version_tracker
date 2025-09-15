import { versionChecker } from './version-checker';

export function initializeApp() {
  // Start periodic version checking (every 2 hours in development, every hour in production)
  const intervalMinutes = process.env.NODE_ENV === 'production' ? 60 : 120;
  
  console.log('Initializing Version Tracker...');
  console.log(`Starting periodic version check every ${intervalMinutes} minutes`);
  
  versionChecker.startPeriodicCheck(intervalMinutes);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down Version Tracker...');
    versionChecker.stopPeriodicCheck();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down Version Tracker...');
    versionChecker.stopPeriodicCheck();
    process.exit(0);
  });
}
