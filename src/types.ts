import type * as cem from "custom-elements-manifest";

export type CemInheritanceOptions = {
  /** Name of the updated CEM file - default is "custom-elements.json" */
  fileName?: string;
  /** Path to output directory */
  outdir?: string;
  /** Class names of any components you would like to exclude from inheritance */
  exclude?: string[];
  /** Omit items from inheritance based on a custom CEM property */
  omitByProperty?: OmittedProperties;
  /** Omit items from inheritance based on CEM Analyzer plugin config */
  omitByConfig?: ConfigOmit;
  /** Skip inheritance for an aspect of your components */
  ignore?: string[];
  /** External CEMs that your components extend */
  externalManifests?: unknown[];
  /** Include external manifest declarations in your manifest */
  includeExternalManifests?: boolean;
  /** Shows process logs */
  debug?: boolean;
  /** Prevents plugin from executing */
  skip?: boolean;
  /** Map of class names to alternative class names */
  aliasMap?: Record<string, string>;
  /**
   * Map of local variable names (holding mixin call results) to the
   * base class name they resolve to.
   *
   * Example: given `const Mixed = mixin(Base); class Foo extends Mixed {}`,
   * pass `{ Mixed: "Base" }` so that the plugin treats `Foo` as extending `Base`.
   *
   * When used as a CEM analyzer plugin this map is populated automatically
   * during the analyze phase.
   */
  mixinVariableMap?: Record<string, string>;
  /** @internal Used to indicate if this is used as a CEM a plugin */
  usedByPlugin?: boolean;
};

/** @deprecated This has been replaced with `CemInheritanceOptions` */
export type Options = CemInheritanceOptions;

export type ConfigOmit = {
  [key: string]: OmittedApis;
};

export type OmittedProperties = {
  attributes?: string;
  cssParts?: string;
  cssProperties?: string;
  cssStates?: string;
  events?: string;
  methods?: string;
  properties?: string;
  slots?: string;
};

export type OmittedApis = Record<keyof OmittedProperties, string[]>;

/** A generic extension of the CEM `MixinDeclaration` type to allow for strongly typing your custom data */
export type Mixin<T = Record<string, unknown>> = cem.MixinDeclaration & T;
