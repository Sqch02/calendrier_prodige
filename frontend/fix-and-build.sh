#!/bin/sh

# Afficher l'environnement
echo "===== ENVIRONNEMENT ====="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PATH: $PATH"
echo "=======================" 

# Nettoyage et installation des dépendances
echo "===== INSTALLATION DES DÉPENDANCES ====="
npm ci || npm install

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
  echo "ERREUR: Installation des dépendances échouée. node_modules introuvable."
  exit 1
fi

echo "node_modules créé avec succès."

# Correction des fichiers ajv
echo "===== CORRECTION DES FICHIERS AJV ====="
node fix-ajv.js

# Vérifier la création des répertoires pour ajv
if [ ! -d "node_modules/ajv/dist/compile" ] || [ ! -d "node_modules/ajv/dist/vocabularies" ]; then
  echo "AVERTISSEMENT: Les répertoires ajv n'ont pas été créés correctement."
  echo "Création manuelle des répertoires..."
  mkdir -p node_modules/ajv/dist/compile
  mkdir -p node_modules/ajv/dist/vocabularies
fi

# Créer les fichiers ajv
echo "===== VÉRIFICATION DES FICHIERS AJV ====="
if [ -f "node_modules/ajv/dist/compile/index.js" ] && [ -f "node_modules/ajv/dist/vocabularies/applicator/index.js" ]; then
  echo "Fichiers ajv déjà corrigés."
else
  echo "Création manuelle des fichiers ajv..."
  
  # S'assurer que le répertoire compile existe
  mkdir -p node_modules/ajv/dist/compile
  
  # Créer le fichier compile/index.js
  cat > node_modules/ajv/dist/compile/index.js << 'EOL'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSchema = exports.getCompilingSchema = exports.SchemaEnv = exports.compileSchema = exports.compileJsonSchema = void 0;
const codegen_1 = require("./codegen");
const resolve_1 = require("./resolve");
Object.defineProperty(exports, "resolveSchema", { enumerable: true, get: function () { return resolve_1.resolveSchema; } });
Object.defineProperty(exports, "getCompilingSchema", { enumerable: true, get: function () { return resolve_1.getCompilingSchema; } });
const validate_1 = require("./validate");
const ref_error_1 = require("./ref_error");
const names_1 = require("./names");
class SchemaEnv {
    constructor(env) {
        var _a;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
            schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : resolve_1.normalizeId(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
    }
}
exports.SchemaEnv = SchemaEnv;
// let codeSize = 0
// let nodeCount = 0
// Compiles schema in SchemaEnv
function compileSchema(sch) {
    // TODO refactor - remove compilations
    const _sch = getCompilingSchema.call(this, sch);
    if (_sch)
        return _sch;
    const rootId = resolve_1.getFullPath.call(this, sch.root.baseId); // TODO if getFullPath removed 1 tests fails
    const { es5, lines } = this.opts.code;
    const { ownProperties } = this.opts;
    const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
    let code;
    try {
        this._compilations.add(sch);
        validate_1.validateFunctionCode(sch, this);
        gen.optimize(this.opts.code.optimize);
        // gen.optimize(1)
        const validateCode = gen.toString();
        code = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        // console.log((codeSize += code.length), (nodeCount += gen.nodeCount))
        if (this.opts.code.process)
            code = this.opts.code.process(code, sch);
        // console.log("\n\n\n *** \n", code)
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, code);
        const validate = makeValidate(this, this.scope.get());
        this.scope.value(names_1.default.validate, validate);
        validate.errors = null;
        validate.schema = sch.schema;
        validate.schemaEnv = sch;
        if (sch.$async)
            validate.$async = true;
        if (this.opts.code.source) {
            validate.source = { validateName: names_1.default.validate, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
            const { props, items } = sch;
            validate.evaluated = {
                props: props instanceof codegen_1.Name ? undefined : props,
                items: items instanceof codegen_1.Name ? undefined : items,
                dynamicProps: props instanceof codegen_1.Name,
                dynamicItems: items instanceof codegen_1.Name,
            };
            if (validate.source)
                validate.source.evaluated = codegen_1.stringify(validate.evaluated);
        }
        sch.validate = validate;
        return sch;
    }
    catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (this.opts.code.process)
            delete gen._values.validate;
        if (codegen_1.isSchemaEnv(e)) {
            this.compilations.delete(e.schema);
            e = ref_error_1.default.call(this, e);
        }
        // console.log("-- compilation error", e)
        throw e;
    }
    finally {
        this._compilations.delete(sch);
    }
}
exports.compileSchema = compileSchema;
function compileJsonSchema(schema, meta) {
    const sch = new SchemaEnv({ schema, meta });
    compileSchema.call(this, sch);
    return sch.validate;
}
exports.compileJsonSchema = compileJsonSchema;
EOL

  # S'assurer que le répertoire vocabularies/applicator existe
  mkdir -p node_modules/ajv/dist/vocabularies/applicator
  
  # Créer le fichier vocabularies/applicator/index.js
  cat > node_modules/ajv/dist/vocabularies/applicator/index.js << 'EOL'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const additionalItems_1 = require("./additionalItems");
const prefixItems_1 = require("./prefixItems");
const items_1 = require("./items");
const items2020_1 = require("./items2020");
const contains_1 = require("./contains");
const dependencies_1 = require("./dependencies");
const propertyNames_1 = require("./propertyNames");
const additionalProperties_1 = require("./additionalProperties");
const properties_1 = require("./properties");
const patternProperties_1 = require("./patternProperties");
const not_1 = require("./not");
const anyOf_1 = require("./anyOf");
const oneOf_1 = require("./oneOf");
const allOf_1 = require("./allOf");
const if_1 = require("./if");
const thenElse_1 = require("./thenElse");
function getApplicator(draft2020 = false) {
    const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default,
    ];
    // array
    if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
    else
        applicator.push(additionalItems_1.default, items_1.default);
    applicator.push(contains_1.default);
    return applicator;
}
exports.default = getApplicator;
EOL

  echo "Fichiers ajv créés manuellement."
fi

# Construction du frontend
echo "===== CONSTRUCTION DU FRONTEND ====="
# Modification : retirer l'option --openssl-legacy-provider
export NODE_ENV=production
export CI=false
export DISABLE_ESLINT_PLUGIN=true

# Utiliser npm run build directement sans l'option problématique
echo "Lancement du build avec NODE_ENV=$NODE_ENV"
npm run build

# Vérifier que le build a réussi
if [ ! -d "build" ]; then
  echo "ERREUR: La construction du frontend a échoué. Le dossier 'build' n'existe pas."
  # Afficher plus d'informations pour le débogage
  echo "Contenu du répertoire actuel:"
  ls -la
  exit 1
fi

echo "===== BUILD TERMINÉ AVEC SUCCÈS ====="
ls -la build
echo "===== CONTENU DU DOSSIER BUILD ====="
find build -type f | sort 