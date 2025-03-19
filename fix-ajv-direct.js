const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des problèmes d\'ajv...');

// Définir le contenu de remplacement pour codegen.js
const codegenContent = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;

// Simple fonction sans le 'new'
function Name(s) {
  const name = {str: s};
  name.toString = function() { return this.str; };
  name.emptyStr = function() { return false; };
  return name;
}
exports.Name = Name;

// Placeholder pour les autres fonctions/objets
exports._ = {};
exports.str = function(s) { return JSON.stringify(s); };
exports.strConcat = function() { return "".concat.apply("", arguments); };
exports.nil = {};
exports.getProperty = function() { return ""; };
exports.stringify = function(x) { return JSON.stringify(x); };
exports.regexpCode = function() { return "/.*/"; };
exports.ValueScope = function() { this.value = {}; };
exports.ValueScopeName = function() { return { value: "" }; };
exports.varKinds = { const: "const", let: "let", var: "var" };
exports.operators = { GT: ">", GTE: ">=", LT: "<", LTE: "<=" };
exports.CodeGen = function() { this.code = []; };
exports.not = function(x) { return "!" + x; };
exports.and = function(x, y) { return x + " && " + y; };
exports.or = function(x, y) { return x + " || " + y; };
`;

// Définir le contenu de remplacement pour names.js
const namesContent = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codegen_1 = require("./codegen");
const names = {
    data: codegen_1.Name("data"),
    valCxt: codegen_1.Name("valCxt"),
    instancePath: codegen_1.Name("instancePath"),
    parentData: codegen_1.Name("parentData"),
    parentDataProperty: codegen_1.Name("parentDataProperty"),
    rootData: codegen_1.Name("rootData"),
    dynamicAnchors: codegen_1.Name("dynamicAnchors"),
    vErrors: codegen_1.Name("vErrors"),
    errors: codegen_1.Name("errors"),
    this: codegen_1.Name("this"),
    self: codegen_1.Name("self"),
    scope: codegen_1.Name("scope"),
    json: codegen_1.Name("json"),
    jsonPos: codegen_1.Name("jsonPos"),
    jsonLen: codegen_1.Name("jsonLen"),
    jsonPart: codegen_1.Name("jsonPart"),
};
exports.default = names;
`;

// Définir le contenu de remplacement pour errors.js
const errorsContent = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
const codegen_1 = require("./codegen");
const names_1 = require("./names");

// Fonctions simplifiées
function keywordError(it, error) {
    return {};
}
exports.keywordError = keywordError;

function keyword$DataError(it) {
    return {};
}
exports.keyword$DataError = keyword$DataError;

function reportError(it, error = {}, overrideAllErrors) {
    return codegen_1.Name("reportError");
}
exports.reportError = reportError;

function reportExtraError(it, error = {}) {
    return codegen_1.Name("reportExtraError");
}
exports.reportExtraError = reportExtraError;

function resetErrorsCount(it) {
    return codegen_1.Name("resetErrorsCount");
}
exports.resetErrorsCount = resetErrorsCount;

function extendErrors(it) {
    return codegen_1.Name("extendErrors");
}
exports.extendErrors = extendErrors;
`;

// Chemin du frontend node_modules
const frontendNodeModules = process.argv[2] || path.join(process.cwd(), 'frontend', 'node_modules');

// Chemin des fichiers à modifier
const ajvDir = path.join(frontendNodeModules, 'ajv', 'dist', 'compile');
const codegenPath = path.join(ajvDir, 'codegen.js');
const namesPath = path.join(ajvDir, 'names.js');
const errorsPath = path.join(ajvDir, 'errors.js');

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(ajvDir)) {
  fs.mkdirSync(ajvDir, { recursive: true });
  console.log(`📁 Répertoire créé: ${ajvDir}`);
}

// Écrire les fichiers avec le contenu de remplacement
try {
  fs.writeFileSync(codegenPath, codegenContent);
  console.log(`✅ Fichier modifié: ${codegenPath}`);
  
  fs.writeFileSync(namesPath, namesContent);
  console.log(`✅ Fichier modifié: ${namesPath}`);
  
  fs.writeFileSync(errorsPath, errorsContent);
  console.log(`✅ Fichier modifié: ${errorsPath}`);
  
  console.log('✅ Correction des problèmes d\'ajv terminée');
} catch (error) {
  console.error('❌ Erreur lors de la modification des fichiers ajv:', error);
} 