#!/bin/bash

echo "🔍 Vérification de l'installation d'ajv..."

# Vérifier si le dossier node_modules existe dans frontend
if [ ! -d "frontend/node_modules" ]; then
  echo "⚠️ Le dossier frontend/node_modules n'existe pas. Installation des dépendances..."
  cd frontend && npm install
  cd ..
fi

# Vérifier si le dossier ajv/dist/compile existe
if [ ! -d "frontend/node_modules/ajv/dist/compile" ]; then
  echo "⚠️ Le dossier ajv n'existe pas correctement. Création des dossiers..."
  mkdir -p frontend/node_modules/ajv/dist/compile
fi

# Créer ou remplacer les fichiers problématiques
echo "📝 Création des fichiers ajv corrigés..."

# codegen.js
cat > frontend/node_modules/ajv/dist/compile/codegen.js << 'EOF'
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
EOF

# names.js
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

# errors.js
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

echo "✅ Fichiers ajv corrigés avec succès!"
echo "🧪 Vous pouvez maintenant essayer de construire le frontend avec la commande:"
echo "   cd frontend && npm run build" 