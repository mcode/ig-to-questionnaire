const struct_definition = require('./cancerds_structuredef.json');

//console.log(struct_definition);

const info = struct_definition.differential.element;

//console.log(info);

filtered = info.filter(function(i) {
    return i.min == 1;
    });

console.log(filtered);

