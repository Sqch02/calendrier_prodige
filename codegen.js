// Correctif pour ajv

function Name(name) {
  if (!(this instanceof Name)) return new Name(name);
  this.str = name;
}

Name.prototype.toString = function() {
  return this.str;
};

Name.prototype.emptyStr = function() {
  return false;
};

// Exporter la fonction Name
exports.Name = Name; 