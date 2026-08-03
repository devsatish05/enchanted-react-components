/* ======================================================================== *
 * Copyright 2024 HCL America Inc.                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 * http://www.apache.org/licenses/LICENSE-2.0                               *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 * ======================================================================== */

const path = require('path');
const fs = require('fs');

// Helper to safely resolve a carbon icon path regardless of single/double dash naming
const resolveCarbonIcon = (iconPath) => {
  try {
    const carbonDir = path.dirname(require.resolve('@carbon/icons/package.json'));
    
    // Try double dash path first, then single dash path fallback
    const doubleDashPath = path.join(carbonDir, 'es', `${iconPath.replace(/-/g, '--')}`, '32.js');
    const singleDashPath = path.join(carbonDir, 'es', `${iconPath}`, '32.js');

    if (fs.existsSync(doubleDashPath)) return doubleDashPath;
    if (fs.existsSync(singleDashPath)) return singleDashPath;
  } catch (e) {
    // Fallback if @carbon/icons isn't resolved directly
  }
  return null;
};

module.exports = {
  "stories": [
    "../src/!(hidden_components)/**/*.stories.@(js|jsx|ts|tsx)",
    "../src/**/*.mdx",
  ],

  "addons": [
    "@storybook/addon-webpack5-compiler-babel",
    "@storybook/addon-links",
    "@storybook/addon-themes",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],

  "framework": {
    name: "@storybook/react-webpack5",
    options: {}
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },

  docs: {
    autodocs: 'tag',
  },

  staticDirs: ['../public'],

  webpackFinal: async (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/', '**/src/__tests__/unit/__image_snapshots__/**/*.png']
    };

    config.resolve = config.resolve || {};
    
    // Dynamically map legacy/mismatched carbon icon paths safely
    const changeCatalog = resolveCarbonIcon('change-catalog');
    const fileStorage = resolveCarbonIcon('file-storage');
    const generatePdf = resolveCarbonIcon('generate-pdf');
    const softwareResource = resolveCarbonIcon('software-resource-resource') || resolveCarbonIcon('software-resource');

    config.resolve.alias = {
      ...config.resolve.alias,
      ...(changeCatalog && { '@carbon/icons/es/change-catalog/32': changeCatalog }),
      ...(fileStorage && { '@carbon/icons/es/file-storage/32': fileStorage }),
      ...(generatePdf && { '@carbon/icons/es/generate-pdf/32': generatePdf }),
      ...(softwareResource && { 
        '@carbon/icons/es/software-resource--resource/32': softwareResource,
        '@carbon/icons/es/software-resource-resource/32': softwareResource 
      }),
    };

    return config;
  }
}