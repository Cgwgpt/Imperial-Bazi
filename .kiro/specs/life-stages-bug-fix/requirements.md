# Requirements Document: 十二长生随机值Bug修复

## Introduction

The Imperial Bazi Pro application contains a critical bug in the `getLifeStage` function that causes incorrect life stage calculations for Bazi charts. The function should return deterministic values based on the day master stem and earthly branch using the `LIFE_STAGES_TABLE` lookup table, but currently returns random or incorrect values. This bug affects the accuracy of all Bazi interpretations and must be fixed to ensure reliable astrological calculations.

## Glossary

- **Day Master (日元)**: The heavenly stem of the day pillar, representing the person's core nature
- **Heavenly Stem (天干)**: One of 10 cyclical characters (甲乙丙丁戊己庚辛壬癸) representing yang/yin and elements
- **Earthly Branch (地支)**: One of 12 cyclical characters (子丑寅卯辰巳午未申酉戌亥) representing zodiac animals and elements
- **Life Stage (十二长生)**: One of 12 stages in the life cycle: 长生, 沐浴, 冠带, 临官, 帝旺, 衰, 病, 死, 墓, 绝, 胎, 养
- **LIFE_STAGES_TABLE**: A lookup table mapping stem-branch combinations to life stage indices
- **Deterministic**: A function that always produces the same output for the same input
- **Stem-Branch Combination**: A pair consisting of one heavenly stem and one earthly branch (120 total combinations)
- **Bazi Chart (八字)**: A chart representing a person's birth time using four pillars (year, month, day, hour)
- **Pillar (柱)**: A pair of stem and branch representing a time unit in the Bazi chart

## Requirements

### Requirement 1: Fix getLifeStage Function Implementation

**User Story:** As a Bazi chart user, I want the life stage calculation to be accurate and deterministic, so that I can trust the astrological interpretations provided by the application.

#### Acceptance Criteria

1. WHEN the getLifeStage function is called with a valid day master stem and earthly branch, THE System SHALL return the correct life stage name from the LIFE_STAGES array
2. WHEN the getLifeStage function is called with the same day master stem and earthly branch multiple times, THE System SHALL return the identical life stage value every time (deterministic behavior)
3. WHEN the getLifeStage function is called with any of the 10 heavenly stems (甲乙丙丁戊己庚辛壬癸), THE System SHALL correctly look up the corresponding row in LIFE_STAGES_TABLE
4. WHEN the getLifeStage function is called with any of the 12 earthly branches (子丑寅卯辰巳午未申酉戌亥), THE System SHALL correctly look up the corresponding column in LIFE_STAGES_TABLE
5. WHEN the getLifeStage function is called with a valid stem-branch combination, THE System SHALL return a value that exists in the LIFE_STAGES array (one of: 长生, 沐浴, 冠带, 临官, 帝旺, 衰, 病, 死, 墓, 绝, 胎, 养)
6. IF the getLifeStage function is called with an invalid or unknown stem, THEN THE System SHALL log a warning and return a default value (长生)
7. IF the getLifeStage function is called with an invalid or unknown branch, THEN THE System SHALL log a warning and return a default value (长生)

### Requirement 2: Verify All Stem-Branch Combinations

**User Story:** As a quality assurance engineer, I want to ensure all 120 possible stem-branch combinations are handled correctly, so that no edge cases are missed in the life stage calculation.

#### Acceptance Criteria

1. WHEN testing all 10 heavenly stems combined with all 12 earthly branches, THE System SHALL handle all 120 combinations without errors
2. WHEN testing all 120 stem-branch combinations, THE System SHALL return a valid life stage value for each combination
3. WHEN testing all 120 stem-branch combinations, THE System SHALL never return undefined, null, or random values
4. WHEN testing all 120 stem-branch combinations, THE System SHALL return values that match the LIFE_STAGES_TABLE exactly

### Requirement 3: Ensure Deterministic Behavior

**User Story:** As a developer, I want the life stage calculation to be completely deterministic, so that the same Bazi chart always produces the same results regardless of when it's calculated.

#### Acceptance Criteria

1. WHEN the getLifeStage function is called 100 times with identical inputs, THE System SHALL return the same life stage value all 100 times
2. WHEN the getLifeStage function is called with different stem-branch combinations, THE System SHALL never return random values
3. WHEN the getLifeStage function is called, THE System SHALL not depend on any external state, time, or random number generation

### Requirement 4: Verify Integration with Bazi Chart Generation

**User Story:** As a Bazi chart user, I want the life stage values in generated charts to be accurate for all pillars, so that the complete chart interpretation is reliable.

#### Acceptance Criteria

1. WHEN a Bazi chart is generated for any birth date and time, THE System SHALL calculate correct life stage values for all four pillars (year, month, day, hour)
2. WHEN a Bazi chart is generated for a male subject, THE System SHALL calculate correct life stage values regardless of gender
3. WHEN a Bazi chart is generated for a female subject, THE System SHALL calculate correct life stage values regardless of gender
4. WHEN a Bazi chart is generated for any birth date, THE System SHALL calculate correct life stage values regardless of the date

### Requirement 5: Maintain Backward Compatibility

**User Story:** As a system maintainer, I want the fix to not break existing functionality, so that other parts of the application continue to work correctly.

#### Acceptance Criteria

1. WHEN the getLifeStage function is fixed, THE System SHALL maintain the same function signature (parameters and return type)
2. WHEN the getLifeStage function is fixed, THE System SHALL not affect other functions in baziEngine.ts
3. WHEN the getLifeStage function is fixed, THE System SHALL not require changes to the LIFE_STAGES_TABLE in constants.ts
4. WHEN the getLifeStage function is fixed, THE System SHALL not affect the Bazi chart generation logic

### Requirement 6: Add Comprehensive Test Coverage

**User Story:** As a developer, I want comprehensive tests for the life stage calculation, so that regressions are caught immediately.

#### Acceptance Criteria

1. WHEN running the test suite, THE System SHALL verify that all 120 stem-branch combinations return correct values
2. WHEN running the test suite, THE System SHALL verify that the function is deterministic (same input produces same output)
3. WHEN running the test suite, THE System SHALL verify that invalid inputs are handled gracefully with warnings
4. WHEN running the test suite, THE System SHALL verify that life stage values match the LIFE_STAGES_TABLE exactly
5. WHEN running the test suite, THE System SHALL verify that generated Bazi charts contain correct life stage values for all pillars
