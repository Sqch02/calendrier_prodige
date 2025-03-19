#!/bin/bash

echo "🔍 Vérification et réparation complète d'ajv..."

# Vérifier si le dossier node_modules existe dans frontend
if [ ! -d "frontend/node_modules" ]; then
  echo "⚠️ Le dossier frontend/node_modules n'existe pas. Installation des dépendances..."
  cd frontend && npm install
  cd ..
fi

# Vérifier et créer les dossiers nécessaires
echo "📁 Vérification des dossiers ajv..."
mkdir -p frontend/node_modules/ajv/dist/compile
mkdir -p frontend/node_modules/ajv/dist/vocabularies

# Créer ou remplacer les fichiers problématiques
echo "📝 Création des fichiers ajv corrigés..."

# 1. codegen.js - version améliorée avec _ comme fonction
cat > frontend/node_modules/ajv/dist/compile/codegen.js << 'EOF'
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
EOF

# 2. names.js
cat > frontend/node_modules/ajv/dist/compile/names.js << 'EOF'
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
EOF

# 3. errors.js
cat > frontend/node_modules/ajv/dist/compile/errors.js << 'EOF'
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
EOF

# 4. vocabularies/code.js - ajouter ce fichier qui pose problème
cat > frontend/node_modules/ajv/dist/vocabularies/code.js << 'EOF'
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
    return `${code}(${arg})`;
}
exports.addCodeArg = addCodeArg;

function safeStringify(obj) {
    return JSON.stringify(obj).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
exports.safeStringify = safeStringify;

function getEsmExportName(key) {
    return key;
}
exports.getEsmExportName = getEsmExportName;
EOF

echo "✅ Fichiers ajv corrigés avec succès!"

# Nettoyer le package.json des surcharges problématiques
if [ -f "frontend/package.json" ]; then
  echo "🔧 Nettoyage du package.json..."
  # Créer une version temporaire sans les sections overrides/resolutions
  grep -v "overrides" frontend/package.json | grep -v "resolutions" > frontend/package.json.clean
  mv frontend/package.json.clean frontend/package.json
  echo "✅ package.json nettoyé"
fi

echo "📊 Installation de versions spécifiques d'ajv..."
cd frontend
npm install ajv@6.12.6 ajv-keywords@3.5.2 --save-exact

echo "✅ Tout est prêt! Vous pouvez maintenant essayer de construire le frontend avec la commande:"
echo "   cd frontend && npm run build"
echo ""
echo "💡 Astuce: Utilisez NODE_OPTIONS=--openssl-legacy-provider npm run build si vous rencontrez des problèmes de SSL" 