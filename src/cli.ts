import { program } from 'commander';
import { TestDataGenerator } from './generator';
import * as fs from 'fs';
import * as path from 'path';

program
  .name('test-data-generator')
  .description('Generate synthetic test data')
  .version('1.0.0');

program
  .command('users')
  .description('Generate users')
  .option('-c, --count <number>', 'Number of users', '1000')
  .option('-o, --output <dir>', 'Output directory', './data')
  .action((options) => {
    const gen = new TestDataGenerator();
    const users = gen.generateUsers(parseInt(options.count));
    writeJson(users, path.join(options.output, 'users.json'));
    console.log(`Generated ${users.length} users -> ${options.output}/users.json`);
  });

program
  .command('orgs')
  .description('Generate organizations')
  .option('-c, --count <number>', 'Number of organizations', '100')
  .option('-o, --output <dir>', 'Output directory', './data')
  .action((options) => {
    const gen = new TestDataGenerator();
    const users = gen.generateUsers(100);
    const ownerIds = users.map(u => u.user_id);
    const orgs = gen.generateOrganizations(parseInt(options.count), ownerIds);
    writeJson(orgs, path.join(options.output, 'organizations.json'));
    console.log(`Generated ${orgs.length} organizations -> ${options.output}/organizations.json`);
  });

program
  .command('events')
  .description('Generate events')
  .option('-c, --count <number>', 'Number of events', '10000')
  .option('-o, --output <dir>', 'Output directory', './data')
  .action((options) => {
    const gen = new TestDataGenerator();
    const users = gen.generateUsers(1000);
    const userIds = users.map(u => u.user_id);
    const events = gen.generateEvents(userIds, parseInt(options.count));
    writeJson(events, path.join(options.output, 'events.json'));
    console.log(`Generated ${events.length} events -> ${options.output}/events.json`);
  });

program
  .command('logs')
  .description('Generate log entries')
  .option('-c, --count <number>', 'Number of log entries', '5000')
  .option('-o, --output <dir>', 'Output directory', './data')
  .action((options) => {
    const gen = new TestDataGenerator();
    const services = ['api-gateway', 'auth-service', 'user-service', 'payment-service', 'notification-service', 'analytics-service'];
    const logs = gen.generateLogs(services, parseInt(options.count));
    writeJson(logs, path.join(options.output, 'logs.json'));
    console.log(`Generated ${logs.length} logs -> ${options.output}/logs.json`);
  });

program
  .command('all')
  .description('Generate all data types')
  .option('-o, --output <dir>', 'Output directory', './data')
  .action((options) => {
    const gen = new TestDataGenerator();
    
    const users = gen.generateUsers(1000);
    const userIds = users.map(u => u.user_id);
    
    const orgs = gen.generateOrganizations(100, userIds);
    
    const events = gen.generateEvents(userIds, 10000);
    
    const services = ['api-gateway', 'auth-service', 'user-service', 'payment-service', 'notification-service', 'analytics-service'];
    const logs = gen.generateLogs(services, 5000);
    
    const outputDir = options.output;
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    writeJson(users, path.join(outputDir, 'users.json'));
    writeJson(orgs, path.join(outputDir, 'organizations.json'));
    writeJson(events, path.join(outputDir, 'events.json'));
    writeJson(logs, path.join(outputDir, 'logs.json'));
    
    console.log('Generated all datasets:');
    console.log(`  ${users.length} users`);
    console.log(`  ${orgs.length} organizations`);
    console.log(`  ${events.length} events`);
    console.log(`  ${logs.length} logs`);
  });

function writeJson(data: any, filepath: string) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

program.parse();