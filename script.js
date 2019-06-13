const { parse } = require("@babel/parser");
const generate = require("@babel/generator").default;
const fs = require("fs");
const path = require("path");

function replaceResult(code) {
  const ast = parse(code);

  // 定義より上にコメントがあればREPLACEから始まっているものかどうか確認する
  for (const b of ast.program.body) {
    const comments = b.leadingComments;
    if (comments && comments.length >= 1) {
      comments.forEach(comment => {
        const matchComment = comment.value.match(
          /^\s+REPLACE\s+(.*)\s+to\s+(.*)/i
        );
        if (matchComment) {
          const fromValue = matchComment[1];
          const toValue = matchComment[2];
          const to = toValue.match(/^\d+/) ? parseInt(toValue, 10) : toValue;
          const from = fromValue.match(/^\d+/)
            ? parseInt(fromValue, 10)
            : fromValue;
          if (b.type === "VariableDeclaration") {
            b.declarations.forEach(dec => {
              if (dec.init.value === from) {
                dec.init.value = to;
              }
            });
          }
        }
      });
    }
  }

  const output = generate(ast, {}, code);
  return output;
}

function init() {
  const input_file = process.argv[2];
  const output_file = process.argv[3];
  if (input_file == null) {
    throw new Error(
      "Error!: input file path is required\nyarn start <input file path> <output file path>"
    );
  }

  if (output_file == null) {
    throw new Error(
      "Error!: output file path is required\nyarn start <input file path> <output file path>"
    );
  }

  fs.readFile(
    path.resolve(__dirname, input_file),
    { encoding: "utf-8" },
    (err, data) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      const { code } = replaceResult(data);
      fs.writeFile(
        path.resolve(__dirname, output_file),
        code,
        { encoding: "utf-8" },
        err => {
          if (err) {
            console.error(err);
            throw err;
          }
        }
      );
    }
  );
}
init();
