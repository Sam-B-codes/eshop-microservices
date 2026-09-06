import nx from "@nx/eslint-plugin";

export default [
  // ====================================================
  // GLOBAL IGNORES
  // ====================================================

  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/out-tsc/**",
      "**/coverage/**",
      "**/.nx/**",
    ],
  },

  // ====================================================
  // NX BASE CONFIGURATIONS
  // ====================================================

  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],

  // ====================================================
  // MODULE BOUNDARIES
  // ====================================================

  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
    ],

    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,

          allow: [
            "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$",
          ],

          depConstraints: [
            {
              sourceTag: "*",

              onlyDependOnLibsWithTags: [
                "*",
              ],
            },
          ],
        },
      ],
    },
  },

  // ====================================================
  // PROJECT RULE OVERRIDES
  // ====================================================

  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.cts",
      "**/*.mts",
      "**/*.js",
      "**/*.jsx",
      "**/*.cjs",
      "**/*.mjs",
    ],

    rules: {},
  },
];