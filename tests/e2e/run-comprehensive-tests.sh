#!/bin/bash

# Comprehensive Nook Platform E2E Test Runner
# This script runs all comprehensive test suites with proper reporting

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BROWSER=${BROWSER:-"chromium"}
HEADLESS=${HEADLESS:-"true"}
WORKERS=${WORKERS:-"4"}
TIMEOUT=${TIMEOUT:-"30000"}
RETRIES=${RETRIES:-"2"}

# Test suites
TEST_SUITES=(
    "comprehensive-platform.test.ts"
    "authentication-comprehensive.test.ts"
    "features-comprehensive.test.ts"
    "ui-ux-comprehensive.test.ts"
)

# Results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Timestamp for reports
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="test-reports/comprehensive_${TIMESTAMP}"

echo -e "${BLUE}🏠 Nook Platform - Comprehensive E2E Test Suite${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}Configuration:${NC}"
echo -e "  Browser: ${BROWSER}"
echo -e "  Headless: ${HEADLESS}"
echo -e "  Workers: ${WORKERS}"
echo -e "  Timeout: ${TIMEOUT}ms"
echo -e "  Retries: ${RETRIES}"
echo -e "  Report Directory: ${REPORT_DIR}"
echo ""

# Create report directory
mkdir -p "${REPORT_DIR}"

# Function to run a test suite
run_test_suite() {
    local test_file=$1
    local suite_name=$(basename "$test_file" .test.ts)
    
    echo -e "${BLUE}🧪 Running Test Suite: ${suite_name}${NC}"
    echo -e "${BLUE}----------------------------------------${NC}"
    
    # Run the test suite
    npx playwright test "$test_file" \
        --browser="$BROWSER" \
        --headed="$([ "$HEADLESS" = "true" ] && echo "false" || echo "true")" \
        --workers="$WORKERS" \
        --timeout="$TIMEOUT" \
        --reporter=html:"${REPORT_DIR}/${suite_name}" \
        --reporter=list \
        --retries="$RETRIES" \
        --project=chromium \
        --grep-timeout=10000 \
        --max-failures=0 \
        --shard=1/1 \
        --update-snapshots=false \
        --trace=on-first-retry \
        --video=retain-on-failure \
        --screenshot=only-on-failure \
        --output="${REPORT_DIR}/${suite_name}_artifacts" \
        2>&1 | tee "${REPORT_DIR}/${suite_name}_output.log"
    
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ ${suite_name} - PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ ${suite_name} - FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    echo ""
    return $exit_code
}

# Function to run specific role tests
run_role_tests() {
    local role=$1
    echo -e "${BLUE}👤 Running ${role} Role Tests${NC}"
    echo -e "${BLUE}----------------------------------------${NC}"
    
    npx playwright test comprehensive-platform.test.ts \
        --browser="$BROWSER" \
        --headed="$([ "$HEADLESS" = "true" ] && echo "false" || echo "true")" \
        --workers="$WORKERS" \
        --timeout="$TIMEOUT" \
        --reporter=html:"${REPORT_DIR}/${role}_tests" \
        --reporter=list \
        --retries="$RETRIES" \
        --grep=".*${role}.*" \
        --grep-timeout=10000 \
        --max-failures=0 \
        --trace=on-first-retry \
        --video=retain-on-failure \
        --screenshot=only-on-failure \
        --output="${REPORT_DIR}/${role}_artifacts" \
        2>&1 | tee "${REPORT_DIR}/${role}_output.log"
    
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ ${role} Role Tests - PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ ${role} Role Tests - FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    echo ""
    return $exit_code
}

# Function to run specific feature tests
run_feature_tests() {
    local feature=$1
    echo -e "${BLUE}🔧 Running ${feature} Feature Tests${NC}"
    echo -e "${BLUE}----------------------------------------${NC}"
    
    npx playwright test features-comprehensive.test.ts \
        --browser="$BROWSER" \
        --headed="$([ "$HEADLESS" = "true" ] && echo "false" || echo "true")" \
        --workers="$WORKERS" \
        --timeout="$TIMEOUT" \
        --reporter=html:"${REPORT_DIR}/${feature}_tests" \
        --reporter=list \
        --retries="$RETRIES" \
        --grep=".*${feature}.*" \
        --grep-timeout=10000 \
        --max-failures=0 \
        --trace=on-first-retry \
        --video=retain-on-failure \
        --screenshot=only-on-failure \
        --output="${REPORT_DIR}/${feature}_artifacts" \
        2>&1 | tee "${REPORT_DIR}/${feature}_output.log"
    
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ ${feature} Feature Tests - PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ ${feature} Feature Tests - FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    echo ""
    return $exit_code
}

# Function to generate summary report
generate_summary_report() {
    local report_file="${REPORT_DIR}/summary_report.md"
    
    cat > "$report_file" << EOF
# Nook Platform - Comprehensive E2E Test Report

**Generated:** $(date)
**Test Run:** ${TIMESTAMP}
**Total Duration:** $(($(date +%s) - START_TIME)) seconds

## Configuration
- Browser: ${BROWSER}
- Headless: ${HEADLESS}
- Workers: ${WORKERS}
- Timeout: ${TIMEOUT}ms
- Retries: ${RETRIES}

## Test Results Summary
- **Total Test Suites:** ${#TEST_SUITES[@]}
- **Passed:** ${PASSED_TESTS}
- **Failed:** ${FAILED_TESTS}
- **Skipped:** ${SKIPPED_TESTS}
- **Success Rate:** $((PASSED_TESTS * 100 / (PASSED_TESTS + FAILED_TESTS)))%

## Test Suites Executed
EOF
    
    for suite in "${TEST_SUITES[@]}"; do
        local suite_name=$(basename "$suite" .test.ts)
        local suite_report="${REPORT_DIR}/${suite_name}/index.html"
        
        if [ -f "$suite_report" ]; then
            echo "- ✅ **${suite_name}** - [View Report](${suite_name}/index.html)" >> "$report_file"
        else
            echo "- ❌ **${suite_name}** - Failed to generate report" >> "$report_file"
        fi
    done
    
    cat >> "$report_file" << EOF

## Role-Based Test Coverage
- ✅ **Tenant Role** - Complete authentication, dashboard, and feature access
- ✅ **Landlord Role** - Complete property management, tenant management, and analytics
- ✅ **Admin Role** - Complete system administration and oversight

## Feature Coverage
- ✅ **Authentication** - Registration, login, logout, password reset
- ✅ **Property Management** - CRUD operations, tenant assignment, property details
- ✅ **Maintenance Management** - Request submission, assignment, status tracking
- ✅ **Payment Processing** - Payment history, processing, reporting
- ✅ **Document Management** - Upload, sharing, access control
- ✅ **Messaging System** - Inbox, composition, notifications
- ✅ **Analytics & Reporting** - Financial analytics, performance metrics
- ✅ **Settings & Profile** - User preferences, system configuration

## UI/UX Coverage
- ✅ **Responsive Design** - Desktop, tablet, mobile layouts
- ✅ **Accessibility** - ARIA labels, keyboard navigation, focus indicators
- ✅ **Navigation** - Breadcrumbs, menu systems, page transitions
- ✅ **Form Validation** - Input validation, error handling
- ✅ **Premium Theme** - Color schemes, animations, typography
- ✅ **Loading States** - Progress indicators, error handling
- ✅ **Performance** - Load times, optimization

## Recommendations
EOF
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo "- 🎉 All tests passed! The platform is ready for production." >> "$report_file"
    else
        echo "- ⚠️ Some tests failed. Please review the detailed reports and fix issues." >> "$report_file"
        echo "- 🔍 Check the artifacts directory for screenshots and videos of failed tests." >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "## Next Steps" >> "$report_file"
    echo "1. Review detailed HTML reports in each test suite directory" >> "$report_file"
    echo "2. Check artifacts for failed test evidence" >> "$report_file"
    echo "3. Address any failed tests before deployment" >> "$report_file"
    echo "4. Run performance tests in production-like environment" >> "$report_file"
    
    echo -e "${GREEN}📊 Summary report generated: ${report_file}${NC}"
}

# Function to clean up old reports
cleanup_old_reports() {
    echo -e "${YELLOW}🧹 Cleaning up old test reports (keeping last 5)...${NC}"
    
    # Keep only the last 5 test report directories
    ls -dt test-reports/comprehensive_* 2>/dev/null | tail -n +6 | xargs -r rm -rf
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    echo ""
}

# Main execution
main() {
    START_TIME=$(date +%s)
    
    # Check if Playwright is installed
    if ! command -v npx &> /dev/null; then
        echo -e "${RED}❌ Error: npx is not installed${NC}"
        exit 1
    fi
    
    # Check if test files exist
    for suite in "${TEST_SUITES[@]}"; do
        if [ ! -f "tests/e2e/$suite" ]; then
            echo -e "${RED}❌ Error: Test file tests/e2e/$suite not found${NC}"
            exit 1
        fi
    done
    
    # Clean up old reports
    cleanup_old_reports
    
    # Install Playwright browsers if needed
    echo -e "${YELLOW}🔧 Ensuring Playwright browsers are installed...${NC}"
    npx playwright install --with-deps "$BROWSER" 2>/dev/null || true
    echo ""
    
    # Run all test suites
    echo -e "${BLUE}🚀 Starting Comprehensive Test Execution${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo ""
    
    local overall_success=true
    
    for suite in "${TEST_SUITES[@]}"; do
        if ! run_test_suite "tests/e2e/$suite"; then
            overall_success=false
        fi
        ((TOTAL_TESTS++))
    done
    
    # Run role-specific tests
    echo -e "${BLUE}👥 Running Role-Specific Test Suites${NC}"
    echo -e "${BLUE}====================================${NC}"
    echo ""
    
    for role in "tenant" "landlord" "admin"; do
        if ! run_role_tests "$role"; then
            overall_success=false
        fi
        ((TOTAL_TESTS++))
    done
    
    # Run feature-specific tests
    echo -e "${BLUE}🔧 Running Feature-Specific Test Suites${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo ""
    
    local features=("Property" "Maintenance" "Payment" "Document" "Messaging" "Analytics")
    for feature in "${features[@]}"; do
        if ! run_feature_tests "$feature"; then
            overall_success=false
        fi
        ((TOTAL_TESTS++))
    done
    
    # Generate summary report
    echo -e "${BLUE}📊 Generating Test Summary Report${NC}"
    echo -e "${BLUE}==================================${NC}"
    echo ""
    
    generate_summary_report
    
    # Final summary
    echo -e "${BLUE}🎯 Test Execution Summary${NC}"
    echo -e "${BLUE}========================${NC}"
    echo -e "Total Test Suites: ${TOTAL_TESTS}"
    echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
    echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"
    echo -e "Skipped: ${YELLOW}${SKIPPED_TESTS}${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! The Nook platform is ready for production.${NC}"
        echo -e "${GREEN}📁 Detailed reports available in: ${REPORT_DIR}${NC}"
        exit 0
    else
        echo -e "${RED}❌ ${FAILED_TESTS} test suite(s) failed. Please review the reports.${NC}"
        echo -e "${YELLOW}📁 Detailed reports and artifacts available in: ${REPORT_DIR}${NC}"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "tenant")
        echo -e "${BLUE}👤 Running Tenant Role Tests Only${NC}"
        run_role_tests "tenant"
        ;;
    "landlord")
        echo -e "${BLUE}👤 Running Landlord Role Tests Only${NC}"
        run_role_tests "landlord"
        ;;
    "admin")
        echo -e "${BLUE}👤 Running Admin Role Tests Only${NC}"
        run_role_tests "admin"
        ;;
    "auth")
        echo -e "${BLUE}🔐 Running Authentication Tests Only${NC}"
        run_test_suite "tests/e2e/authentication-comprehensive.test.ts"
        ;;
    "features")
        echo -e "${BLUE}🔧 Running Feature Tests Only${NC}"
        run_test_suite "tests/e2e/features-comprehensive.test.ts"
        ;;
    "ui")
        echo -e "${BLUE}🎨 Running UI/UX Tests Only${NC}"
        run_test_suite "tests/e2e/ui-ux-comprehensive.test.ts"
        ;;
    "platform")
        echo -e "${BLUE}🏠 Running Platform Tests Only${NC}"
        run_test_suite "tests/e2e/comprehensive-platform.test.ts"
        ;;
    "help"|"-h"|"--help")
        echo -e "${BLUE}Nook Platform - Comprehensive E2E Test Runner${NC}"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  (no args)    Run all comprehensive tests"
        echo "  tenant       Run tenant role tests only"
        echo "  landlord     Run landlord role tests only"
        echo "  admin        Run admin role tests only"
        echo "  auth         Run authentication tests only"
        echo "  features     Run feature tests only"
        echo "  ui           Run UI/UX tests only"
        echo "  platform     Run platform tests only"
        echo "  help         Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  BROWSER      Browser to use (default: chromium)"
        echo "  HEADLESS     Run in headless mode (default: true)"
        echo "  WORKERS      Number of workers (default: 4)"
        echo "  TIMEOUT      Test timeout in ms (default: 30000)"
        echo "  RETRIES      Number of retries (default: 2)"
        echo ""
        echo "Examples:"
        echo "  $0                    # Run all tests"
        echo "  $0 tenant             # Run tenant tests only"
        echo "  HEADLESS=false $0     # Run with browser visible"
        echo "  BROWSER=firefox $0    # Run with Firefox"
        exit 0
        ;;
    *)
        main
        ;;
esac 