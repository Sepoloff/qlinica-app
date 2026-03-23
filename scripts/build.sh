#!/bin/bash

# Qlinica App Build Script
# Optimized build process with cleanup and validation

set -e

echo "🏗️  Building Qlinica App..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="/tmp/qlinica-build"
DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
SCHEME="Qlinica"
CONFIGURATION="Debug"

# Step 1: Check environment
echo -e "${YELLOW}1. Checking environment...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

if [ ! -d "$DEVELOPER_DIR" ]; then
    echo -e "${RED}❌ Xcode not found at $DEVELOPER_DIR${NC}"
    exit 1
fi

export DEVELOPER_DIR
echo -e "${GREEN}✅ Environment OK${NC}"

# Step 2: Install dependencies
echo -e "${YELLOW}2. Installing dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Clean build artifacts
echo -e "${YELLOW}3. Cleaning build artifacts...${NC}"
rm -rf ios/Pods ios/Podfile.lock ~/Library/Developer/Xcode/DerivedData/Qlinica*
echo -e "${GREEN}✅ Cleaned${NC}"

# Step 4: Prebuild
echo -e "${YELLOW}4. Running Expo prebuild...${NC}"
npx expo prebuild --platform ios --clean --no-install
echo -e "${GREEN}✅ Prebuild complete${NC}"

# Step 5: Install pods
echo -e "${YELLOW}5. Installing CocoaPods...${NC}"
cd ios
pod install --repo-update
cd ..
echo -e "${GREEN}✅ Pods installed${NC}"

# Step 6: Build
echo -e "${YELLOW}6. Building iOS app...${NC}"
xcodebuild -workspace "ios/$SCHEME.xcworkspace" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -derivedDataPath "$BUILD_DIR" \
  -destination 'generic/platform=iOS Simulator' \
  build

echo -e "${GREEN}✅ Build successful${NC}"

# Step 7: Verify build output
echo -e "${YELLOW}7. Verifying build output...${NC}"
APP_PATH="$BUILD_DIR/Build/Products/${CONFIGURATION}-iphonesimulator/$SCHEME.app"

if [ -d "$APP_PATH" ]; then
    APP_SIZE=$(du -sh "$APP_PATH" | cut -f1)
    echo -e "${GREEN}✅ App built: $APP_PATH ($APP_SIZE)${NC}"
else
    echo -e "${RED}❌ App not found at $APP_PATH${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Build complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "App location: $APP_PATH"
echo "To run on simulator: npx expo start --ios"
echo ""
