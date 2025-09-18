# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Philosophy

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Process

### 1. Planning & Staging

Break complex work into 3-5 stages. Document in `IMPLEMENTATION_PLAN.md`:

```markdown
## Stage N: [Name]
**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
```
- Update status as you progress
- Remove file when all stages are done

### 2. Implementation Flow

1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message linking to plan

### 3. When Stuck (After 3 Attempts)

**CRITICAL**: Maximum 3 attempts per issue, then STOP.

1. **Document what failed**:
   - What you tried
   - Specific error messages
   - Why you think it failed

2. **Research alternatives**:
   - Find 2-3 similar implementations
   - Note different approaches used

3. **Question fundamentals**:
   - Is this the right abstraction level?
   - Can this be split into smaller problems?
   - Is there a simpler approach entirely?

4. **Try different angle**:
   - Different library/framework feature?
   - Different architectural pattern?
   - Remove abstraction instead of adding?

## Technical Standards

### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

### Code Quality

- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

## Decision Framework

When multiple valid approaches exist, choose based on:

1. **Testability** - Can I easily test this?
2. **Readability** - Will someone understand this in 6 months?
3. **Consistency** - Does this match project patterns?
4. **Simplicity** - Is this the simplest solution that works?
5. **Reversibility** - How hard to change later?

## Project Integration

### Learning the Codebase

- Find 3 similar features/components
- Identify common patterns and conventions
- Use same libraries/utilities when possible
- Follow existing test patterns

### Tooling

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Gates

### Definition of Done

- [ ] Tests written and passing
- [ ] Code follows project conventions
- [ ] No linter/formatter warnings
- [ ] Commit messages are clear
- [ ] Implementation matches plan
- [ ] No TODOs without issue numbers

### Test Guidelines

- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities/helpers
- Tests should be deterministic

## Important Reminders

**NEVER**:
- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions - verify with existing code

**ALWAYS**:
- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Stop after 3 failed attempts and reassess

## Project Overview

This is a psychological testing platform built with React, TypeScript, Vite, and Supabase. The application allows users to take psychological assessments, view basic results, and optionally purchase detailed reports via Stripe payment integration.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Backend**: Supabase (PostgreSQL database + Edge Functions)
- **Payment**: Stripe integration
- **Testing**: Vitest with React Testing Library
- **Routing**: React Router DOM
- **State Management**: React Query (@tanstack/react-query)

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview

# Run tests
npx vitest
```

## Project Structure

- **src/pages/**: Main application pages (Index, PersonalInfo, PsychTest, TestResult, Payment flows)
- **src/components/ui/**: shadcn/ui components (Button, Card, Dialog, etc.)
- **src/services/**: Business logic services (testService.ts, profileService.ts)
- **src/integrations/supabase/**: Supabase client and type definitions
- **src/utils/**: Utility functions (storage, error handling)
- **src/types/**: TypeScript type definitions
- **src/hooks/**: Custom React hooks
- **src/__tests__/**: Test files organized by feature

## Key Application Flow

1. **Landing Page** (`src/pages/Index.tsx`): Introduction and start test button
2. **Personal Info** (`src/pages/PersonalInfo.tsx`): User profile collection
3. **Psychological Test** (`src/pages/PsychTest.tsx`): 10-question assessment
4. **Test Results** (`src/pages/TestResult.tsx`): Basic results display with payment option
5. **Payment Flow** (`src/pages/Payment.tsx`, PaymentSuccess, PaymentFailed): Stripe integration

## Data Architecture

- **User Profiles**: Stored in Supabase `user_profiles` table
- **Test Questions**: Managed in `test_questions` table with scoring
- **Test Sessions**: Results stored in `test_sessions` table with payment status
- **Local Storage**: Used for temporary data persistence (tempUserId, userProfile, testResult, sessionId)

## Key Services

- **TestService** (`src/services/testService.ts`): Handles test questions, scoring, and session management
- **ProfileService** (`src/services/profileService.ts`): Manages user profile creation and retrieval
- **Supabase Client** (`src/integrations/supabase/client.ts`): Database connection and authentication

## Payment Integration

- Stripe payment processing via Supabase Edge Functions
- Payment sessions linked to test sessions
- Full reports unlocked after successful payment

## Testing

- Uses Vitest with jsdom environment
- React Testing Library for component testing
- Test setup in `src/__tests__/setup.ts`

## Environment Configuration

- Supabase URL and keys configured in `src/integrations/supabase/client.ts`
- Environment variables in `.env` file
- Supabase project configuration in `supabase/config.toml`

## Important Notes

- Application uses Chinese language throughout the UI
- Anonymous user support with temporary IDs
- Data persistence combines Supabase storage with localStorage
- Error handling centralized in `src/utils/errorHandler.ts`
- Responsive design with mobile-first approach

