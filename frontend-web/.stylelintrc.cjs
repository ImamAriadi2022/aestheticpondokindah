module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss"],
  plugins: ["stylelint-order"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["tailwind", "apply", "layer", "variants", "responsive", "screen"],
      },
    ],
    "selector-class-pattern": null,
    "property-no-vendor-prefix": null,
    "font-family-name-quotes": null,
    "custom-property-empty-line-before": null,
    "declaration-empty-line-before": null,
    "rule-empty-line-before": null,
    "order/properties-order": [],
  },
};
