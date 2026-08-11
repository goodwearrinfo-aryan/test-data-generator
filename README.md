# Test Data Generator (TypeScript)

Generates synthetic test data for development and testing.

## Output Types
- **Users**: Profiles with roles, activity, metadata
- **Organizations**: Multi-tenant orgs with plans, settings
- **Events**: Analytics events (page views, clicks, purchases, etc.)
- **Logs**: Structured log entries with levels, traces, services

## Usage
```bash
npm install
npm run generate all -- -o ./data
# or individually:
npm run generate users -- -c 5000 -o ./data
npm run generate events -- -c 50000 -o ./data
npm run generate logs -- -c 10000 -o ./data
```

## Output Files
- `users.json` - User profiles
- `organizations.json` - Organization data
- `events.json` - Event stream
- `logs.json` - Log entries
