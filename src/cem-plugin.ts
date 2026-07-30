import { deepMerge } from "@wc-toolkit/cem-utilities";
import { updateCemInheritance } from "./inheritance.js";
import type { CemInheritanceOptions } from "./types";
import type { AnalyzePhaseParams, PackageLinkPhaseParams } from "@custom-elements-manifest/analyzer"
import {parseJsDocTags, type CustomTag} from "@wc-toolkit/jsdoc-tags";
import { defaultUserConfig } from "./default-values.js";

let userOptions = defaultUserConfig;
const defaultTags: CustomTag = {
  'omit': {
    isArray: true,
    mappedName: userOptions.omitByProperty?.attributes,
  },
  'omit-part': {
    isArray: true,
    mappedName: userOptions.omitByProperty?.cssParts,
  },
  'omit-cssprop': {
    isArray: true,
    mappedName: userOptions.omitByProperty?.cssProperties,
  },
  'omit-cssState': {
    isArray: true,
    mappedName: userOptions.omitByProperty?.cssStates
  },
  'omit-event': {
    isArray: true,
    mappedName: userOptions.omitByProperty?.events,
  },
  'omit-slot': {
    isArray: true,
    mappedName: userOptions.omitByProperty?.slots,
  },
  'omit-method': {
    isArray: true,
    mappedName: userOptions.omitByProperty?.methods,
  },
}

export function cemInheritancePlugin(options: CemInheritanceOptions = {}) {
  userOptions = deepMerge(defaultUserConfig, options);
  userOptions.usedByPlugin = true;
  const mixinVariableMap = new Map<string, string>();
  return {
    name: "cem-inheritance",
    analyzePhase(params: AnalyzePhaseParams) {
      const { node, ts } = params;
      parseJsDocTags(params, defaultTags);
      if (!ts.isVariableStatement(node)) {
        return;
      }
      for (const declaration of node.declarationList.declarations) {
        if (
          declaration.initializer
          && ts.isCallExpression(declaration.initializer)
          && ts.isIdentifier(declaration.name)
        ) {
          const varName = declaration.name.text;
          // Walk through chained mixin calls: mixin1(mixin2(Base)) -> "Base"
          let expr = declaration.initializer;
          while (ts.isCallExpression(expr)) {
            const args = expr.arguments;
            if (args.length !== 1) break;
            const arg = args[0];
            if (ts.isIdentifier(arg)) {
              const baseName = arg.text;
              if (varName !== baseName) {
                mixinVariableMap.set(varName, baseName);
              }
              break;
            }
            if (ts.isCallExpression(arg)) {
              expr = arg;
            } else {
              break;
            }
          }
        }
      }
    },
    packageLinkPhase({ customElementsManifest }: PackageLinkPhaseParams) {
      options.usedByPlugin = true;
      if (mixinVariableMap.size > 0 && customElementsManifest?.modules) {
        for (const mod of customElementsManifest.modules) {
          if (!mod.declarations) continue;
          for (const decl of mod.declarations) {
            if (
              decl.kind === "class"
              && decl.superclass?.name
              && mixinVariableMap.has(decl.superclass.name)
            ) {
              decl.superclass.name = mixinVariableMap.get(decl.superclass.name)!;
            }
          }
        }
      }
      updateCemInheritance(customElementsManifest, userOptions);
    },
  };
}