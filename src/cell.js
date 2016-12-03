var Cell = function ($el, position, formula) {
    this.$el = $el;

    this.name = Cell.positionToName(position);
    this.deps = {};
    this.value = 0;
    this.reverseDeps = {};
    this.formula = '';
    this.position = position;

    if (formula) {
        this.setFormula(formula);
    }
    return this;
};

Cell.positionToName = function (position) {
    return Cell.toLetters(position.x + 1) + (position.y + 1);
};

Cell.nameToPosition = function (name) {
    name = name.toUpperCase();
    Cell.variableExp.lastIndex = 0;
    var res = App.variableExp.exec(name);
    return {
        x: Cell.fromLetters(res[1]) - 1,
        y: res[2] - 1
    };
};
/**
 * string representation of cell
 */
Cell.variableExp = /([A-Z]+)(\d+)/ig;
Cell.toLetters = function (num) {
    var mod = num % 26;
    var pow = num / 26 | 0;
    var out = mod ? String.fromCharCode(64 + mod) : (pow--, 'Z');
    return pow ? this.toLetters(pow) + out : out;
};
Cell.fromLetters = function (str) {
    var out = 0,
        len = str.length,
        pos = len;
    while ((pos -= 1) > -1) {
        out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - 1 - pos);
    }
    return out;
};

Cell.prototype = {
    update: function () {
        var res = this.compileFormula(this.formula);
        this.value = res;
        this.$el.html(res);
    },
    compileFormula: function (formula, deps) {
        var self = this;
        Cell.variableExp.lastIndex = 0;

        if (!formula)
            return 0;

        formula = formula.replace(Cell.variableExp, function (cellName) {
            var cell = App.cache[cellName];


            if (deps) {
                self.deps[cellName] = true;
                cell.reverseDeps[self.name] = true;
            }

            return cell.value;
        });


        formula = $.trim(formula, '=');

        var result;

        try {
            result = eval(formula);
        } catch (e) {
            debugger;
        }

        return result;
    },

    setFormula: function (formula) {

        for (var dep in this.deps) {
            delete App.cache[dep].reverseDeps[this.name];
        }
        this.formula = formula;

        var result = this.compileFormula(formula, true);

        this.value = result;
        this.$el.html(result);

        App.updateCells(this.reverseDeps);

    },
};