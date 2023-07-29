// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import("eslint").Linter.Config} */
const config = {
  overrides: [
    {
      extends: [
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: path.join(__dirname, "tsconfig.json"),
  },
  plugins: ["@typescript-eslint", "react", "prettier"],
  extends: [
    "next/core-web-vitals",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-misused-promises": ["off", {
      checksVoidReturn: false,
      checksSpreads: false,
    }],
    "@typescript-eslint/no-floating-promises": ["off"], // does not work shitty rule!!!
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unsafe-enum-comparison": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/no-unescaped-entities": "off",
    "react/jsx-curly-brace-presence": [
      "error",
      {
        props: "never",
        children: "never",
      },
    ],
  },
};

module.exports = config;
