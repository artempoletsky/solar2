var Cell = function ($el, position) {
    this.$el = $el;

    if (typeof position == 'string') {
        this.position = Cell.nameToPosition(position);
        this.name = position;
    } else {
        this.name = Cell.positionToName(position);
        this.position = position;
    }


    Cell.cache[this.name] = this;
    this.deps = {};
    this.value = 0;
    this.reverseDeps = {};
    this.formula = '';

    return this;
};

Cell.positionToName = function (position) {
    return Cell.toLetters(position.x + 1) + (position.y + 1);
};

Cell.nameToPosition = function (name) {
    name = name.toUpperCase();
    Cell.variableExp.lastIndex = 0;
    var res = Cell.variableExp.exec(name);
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

Cell.updateCells = function (startCell) {

    var error = false;
    var temp = 0;
    var finish = false;
    var recur = function (parentCell) {

        var reverseDeps = parentCell.reverseDeps;
        for (var name in reverseDeps) {
            var cell = Cell.cache[name];

            if (cell == startCell) {
                error = true;
            }

            if (error) {
                if (!cell.loopError && temp++ < 10) {
                    //console.log(cell.name);
                    cell.loopError = true;
                    cell.$el.html('loop_error');
                    recur(cell);
                }
                continue;
            }

            cell.loopError = false;

            cell.update();
            recur(cell);
        }
    };

    recur(startCell);

};

Cell.cache = {};

Cell.prototype = {
    update: function () {
        var res = this.compileFormula(this.formula);
        this.value = res;
        this.$el.html(res);
    },
    compileFormula: function (formula, deps) {
        var self = this;
        Cell.variableExp.lastIndex = 0;

        if (formula === '') {
            return '';
        }


        formula = formula.replace(Cell.variableExp, function (cellName) {
            var cell = Cell.cache[cellName];

            if (cell.loopError) {
                self.loopError = true;
            }

            if (deps) {
                self.deps[cellName] = true;
                cell.reverseDeps[self.name] = true;
            }

            return cell.value || 0;
        });

        if (self.loopError) {
            return 'loop error';
        }

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

        var deps = this.deps;

        for (var dep in deps) {
            delete Cell.cache[dep].reverseDeps[this.name];
        }
        this.loopError = false;
        this.formula = formula;

        var result = this.compileFormula(formula, true);

        this.value = result;
        this.$el.html(result);

        Cell.updateCells(this);

    },
};