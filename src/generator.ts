import { faker } from '@faker-js/faker';
import { User, Event, LogEntry, Organization } from './types';

faker.seed(42);

export class TestDataGenerator {
  private users: User[] = [];
  private organizations: Organization[] = [];

  generateUsers(count: number): User[] {
    const users: User[] = [];
    const roles: User['role'][] = ['admin', 'user', 'moderator', 'guest'];
    const roleWeights = [0.02, 0.85, 0.08, 0.05];

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.username({ firstName, lastName });

      users.push({
        user_id: `USER_${i.toString().padStart(6, '0')}`,
        email: faker.internet.email({ firstName, lastName }),
        first_name: firstName,
        last_name: lastName,
        username,
        avatar_url: faker.image.avatar(),
        role: this.weightedChoice(roles, roleWeights),
        is_active: faker.datatype.boolean(0.9),
        created_at: faker.date.past({ years: 3 }).toISOString(),
        last_login_at: faker.datatype.boolean(0.7)
          ? faker.date.recent({ days: 30 }).toISOString()
          : null,
        metadata: {
          source: faker.helpers.arrayElement(['organic', 'referral', 'paid', 'social']),
          utm_campaign: faker.string.alphanumeric(8),
          referral_code: faker.string.alphanumeric(6),
        },
      });
    }

    this.users = users;
    return users;
  }

  generateOrganizations(count: number, ownerIds: string[]): Organization[] {
    const plans: Organization['plan'][] = ['free', 'starter', 'pro', 'enterprise'];
    const planWeights = [0.5, 0.3, 0.15, 0.05];

    const orgs: Organization[] = [];
    for (let i = 0; i < count; i++) {
      const name = faker.company.name();
      orgs.push({
        org_id: `ORG_${i.toString().padStart(6, '0')}`,
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        plan: this.weightedChoice(plans, planWeights),
        owner_id: faker.helpers.arrayElement(ownerIds),
        member_count: faker.number.int({ min: 1, max: 500 }),
        created_at: faker.date.past({ years: 2 }).toISOString(),
        settings: {
          sso_enabled: faker.datatype.boolean(0.1),
          mfa_required: faker.datatype.boolean(0.3),
          data_retention_days: faker.helpers.arrayElement([30, 90, 365, 2555]),
          custom_domain: faker.datatype.boolean(0.15),
        },
      });
    }

    this.organizations = orgs;
    return orgs;
  }

  generateEvents(userIds: string[], count: number): Event[] {
    const eventTypes = [
      'page_view', 'click', 'form_submit', 'purchase', 'signup',
      'login', 'logout', 'api_call', 'feature_use', 'error'
    ];
    const eventNames = {
      page_view: ['home', 'dashboard', 'settings', 'profile', 'billing'],
      click: ['cta_button', 'nav_link', 'dropdown', 'modal_trigger', 'tab'],
      form_submit: ['contact', 'signup', 'checkout', 'search', 'feedback'],
      purchase: ['subscription', 'one_time', 'upgrade', 'addon'],
      api_call: ['rest', 'graphql', 'webhook', 'batch'],
    };

    const events: Event[] = [];
    for (let i = 0; i < count; i++) {
      const userId = faker.helpers.arrayElement(userIds);
      const eventType = faker.helpers.arrayElement(eventTypes);
      const eventName = faker.helpers.arrayElement(eventNames[eventType as keyof typeof eventNames] || ['unknown']);

      events.push({
        event_id: `EVT_${i.toString().padStart(8, '0')}`,
        user_id: userId,
        event_type: eventType,
        event_name: eventName,
        properties: {
          url: faker.internet.url(),
          referrer: faker.internet.url(),
          user_agent: faker.internet.userAgent(),
          viewport: `${faker.number.int({ min: 320, max: 1920 })}x${faker.number.int({ min: 480, max: 1080 })}`,
          duration_ms: faker.number.int({ min: 10, max: 300000 }),
          ...(eventType === 'purchase' && {
            amount: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
            currency: 'USD',
            plan: faker.helpers.arrayElement(['monthly', 'annual']),
          }),
        },
        timestamp: faker.date.recent({ days: 30 }).toISOString(),
        session_id: `SESS_${faker.string.alphanumeric(16)}`,
      });
    }

    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  generateLogs(serviceNames: string[], count: number): LogEntry[] {
    const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const levelWeights = [0.4, 0.35, 0.15, 0.08, 0.02];

    const logs: LogEntry[] = [];
    for (let i = 0; i < count; i++) {
      const service = faker.helpers.arrayElement(serviceNames);
      const level = this.weightedChoice(levels, levelWeights);

      logs.push({
        log_id: `LOG_${i.toString().padStart(8, '0')}`,
        level,
        message: this.generateLogMessage(service, level),
        service,
        trace_id: `TRACE_${faker.string.alphanumeric(32)}`,
        span_id: `SPAN_${faker.string.alphanumeric(16)}`,
        timestamp: faker.date.recent({ days: 7 }).toISOString(),
        metadata: {
          hostname: faker.internet.domainName(),
          pid: faker.number.int({ min: 1, max: 65535 }),
          version: `v${faker.number.int({ min: 1, max: 10 })}.${faker.number.int({ min: 0, max: 20 })}.${faker.number.int({ min: 0, max: 50 })}`,
          environment: faker.helpers.arrayElement(['development', 'staging', 'production']),
        },
      });
    }

    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private weightedChoice<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  private generateLogMessage(service: string, level: LogEntry['level']): string {
    const messages = {
      debug: [
        `Cache hit for key: user:${faker.string.alphanumeric(8)}`,
        `DB query executed in ${faker.number.int({ min: 1, max: 100 })}ms`,
        `Processing request ${faker.string.alphanumeric(12)}`,
      ],
      info: [
        `User ${faker.string.alphanumeric(8)} logged in`,
        `Order ${faker.string.alphanumeric(10)} created`,
        `Email sent to ${faker.internet.email()}`,
        `Job ${faker.string.alphanumeric(8)} completed successfully`,
      ],
      warn: [
        `Rate limit approached for IP ${faker.internet.ip()}`,
        `Slow query detected: ${faker.number.int({ min: 1000, max: 10000 })}ms`,
        `Retry attempt ${faker.number.int({ min: 1, max: 3 })} for ${service}`,
        `Deprecated API endpoint called: /api/v1/${faker.string.alphanumeric(6)}`,
      ],
      error: [
        `Failed to connect to database: connection timeout`,
        `Payment processing failed for order ${faker.string.alphanumeric(10)}`,
        `Unhandled exception in ${service}: ${faker.lorem.sentence()}`,
        `Third-party API error: ${faker.internet.domainName()} returned 5xx`,
      ],
      fatal: [
        `Out of memory: process terminated`,
        `Database corruption detected, shutting down`,
        `Critical security breach detected`,
      ],
    };
    return faker.helpers.arrayElement(messages[level]);
  }
}
