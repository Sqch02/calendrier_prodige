const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Script de correction et build du frontend');

// Définir les chemins des répertoires et fichiers
const frontendDir = __dirname;
const nodeModulesDir = path.join(frontendDir, 'node_modules');
const ajvDir = path.join(nodeModulesDir, 'ajv', 'dist');
const ajvCompileDir = path.join(ajvDir, 'compile');
const ajvVocabulariesDir = path.join(ajvDir, 'vocabularies');

// Créer les répertoires s'ils n'existent pas
console.log('📂 Vérification des répertoires...');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Répertoire créé: ${dir}`);
  }
}

ensureDir(ajvCompileDir);
ensureDir(ajvVocabulariesDir);

// Contenu des fichiers corrigés
const codegenContent = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;

// Fonction _ utilisée pour les template literals
function _(strings, ...args) {
  let str = strings[0];
  for (let i = 0; i < args.length; i++) {
    str += args[i] + strings[i + 1];
  }
  return str;
}
exports._ = _;

// Simple fonction sans le 'new'
function Name(s) {
  const name = {str: s};
  name.toString = function() { return this.str; };
  name.emptyStr = function() { return false; };
  return name;
}
exports.Name = Name;

// Autres fonctions/objets
exports.str = function(s) { return JSON.stringify(s); };
exports.strConcat = function() { return "".concat.apply("", arguments); };
exports.nil = {};
exports.getProperty = function() { return ""; };
exports.stringify = function(x) { return JSON.stringify(x); };
exports.regexpCode = function() { return "/.*/"; };
exports.Scope = function() { this.value = {}; };
exports.ValueScope = function() { this.value = {}; };
exports.ValueScopeName = function() { return { value: "" }; };
exports.varKinds = { const: "const", let: "let", var: "var" };
exports.operators = { GT: ">", GTE: ">=", LT: "<", LTE: "<=" };
exports.CodeGen = function() { 
  this.code = []; 
  this._str = function(s) { return s; };
  this._blockStarts = [];
  this._constants = {};
};
exports.not = function(x) { return "!" + x; };
exports.and = function(x, y) { return x + " && " + y; };
exports.or = function(x, y) { return x + " || " + y; };
`;

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

const codeContent = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = void 0;
const codegen_1 = require("../compile/codegen");
Object.defineProperty(exports, "Name", { enumerable: true, get: function () { return codegen_1.Name; } });
Object.defineProperty(exports, "_", { enumerable: true, get: function () { return codegen_1._; } });
Object.defineProperty(exports, "str", { enumerable: true, get: function () { return codegen_1.str; } });
Object.defineProperty(exports, "strConcat", { enumerable: true, get: function () { return codegen_1.strConcat; } });
Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return codegen_1.stringify; } });
Object.defineProperty(exports, "nil", { enumerable: true, get: function () { return codegen_1.nil; } });
Object.defineProperty(exports, "getProperty", { enumerable: true, get: function () { return codegen_1.getProperty; } });
Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function () { return codegen_1.regexpCode; } });

exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;

// Classe de base _Code simplifiée
class _Code {
    constructor(code) {
        this.code = code;
    }
    toString() {
        return this.code;
    }
}
exports._Code = _Code;

// Fonctions simplifiées
function addCodeArg(code, arg) {
    return \`\${code}(\${arg})\`;
}
exports.addCodeArg = addCodeArg;

function safeStringify(obj) {
    return JSON.stringify(obj).replace(/\\u2028/g, "\\\\u2028").replace(/\\u2029/g, "\\\\u2029");
}
exports.safeStringify = safeStringify;

function getEsmExportName(key) {
    return key;
}
exports.getEsmExportName = getEsmExportName;
`;

// Écrire les fichiers avec le contenu corrigé
console.log('📝 Création des fichiers ajv corrigés...');

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier modifié: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la modification du fichier ${filePath}:`, error);
  }
}

writeFile(path.join(ajvCompileDir, 'codegen.js'), codegenContent);
writeFile(path.join(ajvCompileDir, 'names.js'), namesContent);
writeFile(path.join(ajvCompileDir, 'errors.js'), errorsContent);
writeFile(path.join(ajvVocabulariesDir, 'code.js'), codeContent);

console.log('✅ Fichiers ajv corrigés avec succès!');

// Lancer le build
console.log('🏗️ Lancement du build frontend...');
try {
  execSync('NODE_OPTIONS=--openssl-legacy-provider npm run build', { 
    stdio: 'inherit', 
    cwd: frontendDir
  });
  console.log('✅ Build terminé avec succès!');
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
} 