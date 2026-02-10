# Implementation Plan: API Key Security Fix

## Overview

This implementation plan addresses the critical security vulnerability where the Gemini API key is hardcoded and exposed in version control. The fix involves three main phases:

1. **Immediate Security Fixes**: Remove exposed keys, configure Git, and set up environment variables
2. **Frontend Implementation**: Update config.ts and create secure API client
3. **Backend Implementation** (Optional): Implement API proxy for production safety

The implementation follows a requirements-first approach, ensuring each task directly addresses specific security requirements.

## Tasks

- [ ] 1. Immediate Security Response
  - [ ] 1.1 Revoke exposed API key
    - Contact Google Cloud Console and revoke the exposed API key immediately
    - Document the revocation timestamp and reason
    - _Requirements: 1.1_
  
  - [ ] 1.2 Update .gitignore configuration
    - Add .env.local entry to .gitignore
    - Add .env entry to .gitignore
    - Add .env.*.local entry to .gitignore
    - Verify entries are properly formatted
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 1.3 Create .env.example template file
    - Create .env.example with VITE_GEMINI_API_KEY placeholder
    - Add comments explaining each variable
    - Ensure no real API keys are included
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 1.4 Update config.ts to use environment variables
    - Replace hardcoded values with environment variable references
    - Implement validation to check if API key is configured
    - Add clear error messages for missing configuration
    - _Requirements: 1.2, 2.1_

- [ ] 2. Frontend API Client Implementation
  - [ ] 2.1 Create secure API client module
    - Create utils/apiClient.ts with APIClient interface
    - Implement environment variable reading logic
    - Add request/response interceptors for logging
    - Ensure API key is never logged in full
    - _Requirements: 2.1, 2.3, 8.1, 8.2_
  
  - [ ]* 2.2 Write property test for environment variable reading
    - **Property 1: Environment variable reading correctness**
    - **Validates: Requirements 2.1**
  
  - [ ] 2.3 Implement API key validation and error handling
    - Create validation function to check if API key is configured
    - Implement error handling for missing/invalid keys
    - Display user-friendly error messages without exposing key content
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ]* 2.4 Write property test for API key validation
    - **Property 9: Missing key displays error**
    - **Validates: Requirements 7.2**
  
  - [ ] 2.5 Create secure logging utility
    - Implement logging that records key existence (boolean) not content
    - Add key length logging instead of full key
    - Ensure production environment disables debug logs
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [ ]* 2.6 Write property test for secure logging
    - **Property 3: Logs do not expose complete key**
    - **Property 14: Key status logging only shows existence/length**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 3. Configuration and Build Setup
  - [ ] 3.1 Update vite.config.ts for environment variable handling
    - Configure Vite to load environment variables
    - Ensure API key is not included in production builds
    - Set up environment-specific configurations
    - _Requirements: 2.4_
  
  - [ ]* 3.2 Write property test for production build security
    - **Property 2: API key not in production builds**
    - **Validates: Requirements 2.4**
  
  - [ ] 3.3 Verify config.ts is properly configured
    - Ensure GEMINI_API_KEY field is empty string
    - Verify environment variable injection works
    - Test in both development and production modes
    - _Requirements: 1.2_
  
  - [ ]* 3.4 Write property test for config.ts correctness
    - **Property 4: Config file API key is empty**
    - **Validates: Requirements 1.2**

- [ ] 4. Git and Documentation Security
  - [ ] 4.1 Verify .gitignore configuration
    - Confirm .env.local is ignored
    - Confirm .env is ignored
    - Confirm .env.*.local is ignored
    - Test that git refuses to commit these files
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 4.2 Write property test for .gitignore configuration
    - **Property 5: .gitignore contains environment files**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [ ] 4.3 Verify .env.example contains all required variables
    - Check that VITE_GEMINI_API_KEY is present
    - Verify no real API keys are in the file
    - Ensure clear instructions are provided
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 4.4 Write property test for .env.example correctness
    - **Property 6: .env.example contains all required variables**
    - **Property 7: .env.example does not contain real keys**
    - **Validates: Requirements 4.2, 4.3**
  
  - [ ] 4.5 Update README.md with security setup instructions
    - Add section on environment variable configuration
    - Include step-by-step setup instructions
    - Document .env.local setup process
    - Add security best practices section
    - Ensure no real API keys in documentation
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 4.6 Write property test for documentation security
    - **Property 8: Documentation does not contain API keys**
    - **Validates: Requirements 6.4**

- [ ] 5. Checkpoint - Verify Core Security Fixes
  - Ensure all tests pass
  - Verify .env.local is properly ignored by git
  - Confirm config.ts uses environment variables
  - Check that no API keys appear in logs
  - Ask the user if questions arise

- [ ] 6. Backend API Proxy Implementation (Optional)
  - [ ] 6.1 Set up backend server structure
    - Create server directory and basic Express setup
    - Configure environment variable loading for backend
    - Set up request validation middleware
    - _Requirements: 5.1_
  
  - [ ] 6.2 Implement /api/bazi-interpret endpoint
    - Create POST endpoint for AI interpretation requests
    - Implement request validation
    - Use server-side stored API key for Gemini calls
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 6.3 Write property test for backend proxy key usage
    - **Property 10: Backend proxy uses server-side key**
    - **Validates: Requirements 5.2**
  
  - [ ] 6.4 Implement response forwarding and error handling
    - Forward Gemini API responses to frontend
    - Implement proper HTTP status codes
    - Handle errors appropriately
    - _Requirements: 5.4, 5.5_
  
  - [ ]* 6.5 Write property test for backend proxy validation
    - **Property 11: Backend proxy validates requests**
    - **Validates: Requirements 5.3**
  
  - [ ]* 6.6 Write property test for backend proxy error handling
    - **Property 13: Backend proxy returns appropriate errors**
    - **Validates: Requirements 5.5**
  
  - [ ] 6.7 Update frontend API client to use proxy
    - Modify apiClient.ts to call backend proxy in production
    - Implement fallback to direct API in development
    - Add proxy URL configuration
    - _Requirements: 5.1_
  
  - [ ]* 6.8 Write property test for backend proxy response forwarding
    - **Property 12: Backend proxy forwards responses correctly**
    - **Validates: Requirements 5.4**

- [ ] 7. Final Security Verification
  - [ ] 7.1 Scan codebase for hardcoded API keys
    - Use grep or similar tools to search for API key patterns
    - Verify no hardcoded keys remain in source files
    - Check all configuration files
    - _Requirements: 1.1_
  
  - [ ] 7.2 Verify production build contains no secrets
    - Build production version
    - Inspect build output for API keys
    - Verify environment variables are not embedded
    - _Requirements: 2.4_
  
  - [ ] 7.3 Review git history for exposed keys
    - Check if exposed key appears in git history
    - Document findings and remediation steps
    - Consider using git-filter-branch if needed
    - _Requirements: 1.1_
  
  - [ ] 7.4 Verify all error messages are user-friendly
    - Test error scenarios
    - Confirm no API keys appear in error messages
    - Verify clear guidance is provided to users
    - _Requirements: 7.4, 8.3_
  
  - [ ]* 7.5 Write property test for error message security
    - **Property 15: Error messages do not expose API key**
    - **Validates: Requirements 7.4, 8.3**

- [ ] 8. Final Checkpoint - Ensure All Tests Pass
  - Ensure all tests pass
  - Verify security fixes are complete
  - Confirm documentation is updated
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests should validate specific examples and edge cases
- Security verification tasks (7.1-7.3) are critical and should not be skipped
- Backend proxy implementation (Section 6) is optional but recommended for production
- All API key references should be removed from git history using appropriate tools
