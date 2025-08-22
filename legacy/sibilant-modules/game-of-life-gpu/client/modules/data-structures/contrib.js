var {
    Matrix,
    MatrixView,
    Kernel
} = require("kit/js/matrix"), {
    Tree,
    TreeMap
} = require("tree-kit");
exports.Matrix = Matrix;
exports.MatrixView = MatrixView;
exports.kernel = kernel;
var matrix = create(Matrix);
exports.matrix = matrix;
var kernel = create(Kernel);
exports.kernel = kernel;
var matrixView = create(MatrixView);
exports.matrixView = matrixView;
var treeMap = create(TreeMap);
exports.treeMap = treeMap;