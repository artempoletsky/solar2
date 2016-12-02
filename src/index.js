var App = {
    /**
     * template for table cell div
     */
    $cellTempl: undefined,
    /**
     * main table object
     */
    $table: undefined,
    /**
     * flag when content editable is active
     */
    recordingFormula: false,
    /**
     * position of current editable cell {x: 0, y: 0}
     */
    recordingPosition: undefined,
    /**
     * string representation of cell
     */
    variableExp: /([A-Z]+)(\d+)/ig,
    /**
     * App entry point
     */
    ready: function () {
        App.$cellTempl = $('.table_cell');
        App.$table = $('.main_table');
        App.drawTable(10, 10);

        $('body').on('keydown', App.onKeyDown);

        App.$table.on('click', App.onTableClick);
        App.$table.on('mousedown', App.onTableMouseDown);
        App.$table.on('dblclick', App.startRecordingFormula);
    },
    /**
     *
     * @param e - event object
     */
    startRecordingFormula: function (e) {
        if (e.target.classList.contains('table_cell')) {

            var $target = $(e.target);
            $('.table_cell.focused').removeClass('focused');
            var f = $target.data('formula');
            if (f) {
                $target.html(f);
            }
            $target
                .attr('contenteditable', 'true')
                .addClass('editable')
                .focus();


            App.recordingPosition = App.getCellPosition($target);
            App.recordingFormula = true;
        }
    },
    drawTable: function (width, height) {
        this.$table.empty();
        for (var i = 0; i < height; i++) {
            var $tr = $.make('tr');
            for (var j = 0; j < width; j++) {
                var $td = $.make('td');
                $tr.append($td.append(this.$cellTempl.clone()));
            }
            this.$table.append($tr);
        }
    },
    toLetters: function (num) {
        var mod = num % 26;
        var pow = num / 26 | 0;
        var out = mod ? String.fromCharCode(64 + mod) : (pow--, 'Z');
        return pow ? this.toLetters(pow) + out : out;
    },
    fromLetters: function (str) {
        var out = 0,
            len = str.length,
            pos = len;
        while ((pos -= 1) > -1) {
            out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - 1 - pos);
        }
        return out;
    },
    onKeyDown: function (e) {
        if (App.recordingFormula && e.keyCode == 13) {
            e.preventDefault();

            var pos = App.getCellPosition($('.editable'));
            App.stopRecordingFormula();
            App.setFocus(pos.x, pos.y + 1);
        }
    },
    stopRecordingFormula: function () {
        var $editable = $('.editable')
            .removeAttr('contenteditable')
            .removeClass('editable');
        var formula = $editable.text();


        $('.formula_focused').removeClass('formula_focused');

        $editable.data('formula', formula);

        App.setCellFormula($editable, formula);


        Selection.clear();
        App.recordingFormula = false;
    },
    setFocus: function (x, y) {
        var $cell;
        if (y) {
            $cell = this.getCellByPosition(x, y);
        } else {
            $cell = $(x);
        }

        $cell.switchClassTo('focused');
    },
    getCellByPosition: function (x, y) {
        return this.$table.children().eq(y).children().eq(x).children().eq(0);
    },
    /**
     * @param name AA11 etc
     */
    getCellByName: function (name) {
        name = name.toUpperCase();
        App.variableExp.lastIndex = 0;
        var res = App.variableExp.exec(name);

        var x = App.fromLetters(res[1]) - 1;
        var y = res[2] - 1;

        return App.getCellByPosition(x, y);
    },

    getCellName: function ($cell) {
        var name = $cell.data('name');
        if (!name) {
            var pos = App.getCellPosition($cell);
            name = App.toLetters(pos.x + 1) + (pos.y + 1);
            $cell.data('name', name);
        }
        return name;
    },

    updateCells: function (reverseDeps) {

        for (var name in reverseDeps) {
            var $cell = App.getCellByName(name);

            var result = App.compileFormula($cell.data('formula'));

            $cell
                .data('value', result)
                .html(result);

            App.updateCells($cell.data('reverseDeps'));
        }
    },

    compileFormula: function (formula, deps, name) {
        this.variableExp.lastIndex = 0;

        if (!formula)
            return 0;

        formula = formula.replace(this.variableExp, function (cell) {
            var $cell = App.getCellByName(cell);

            if (deps) {
                //write deps
                deps[cell] = true;
                var rd = $cell.data('reverseDeps') || {};
                rd[name] = true;
                $cell.data('reverseDeps', rd);
            }

            return App.getCellValue($cell);
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

    setCellFormula: function ($cell, formula) {


        var deps = $cell.data('deps') || {};

        var reverseDeps = $cell.data('reverseDeps');

        var name = App.getCellName($cell);


        //fixme: это плохо
        for (var dep in deps) {
            delete App.getCellByName(dep).data(reverseDeps)[name];
        }

        var result = App.compileFormula(formula, deps, name);

        $cell.data('value', result).html(result);

        App.updateCells(reverseDeps);

    },

    getCellValue: function ($cell) {
        return $cell.data('value') || 0;
    },

    getCellPosition: function ($cell) {
        var $parent = $cell.parent();
        return {
            x: $parent.index(),
            y: $parent.parent().index()
        };
    },

    onTableClick: function (e) {
        if (e.target.className == 'table_cell') {
            var $target = $(e.target);


            if (App.recordingFormula) {

                var $editable = $('.editable');
                var formula = $editable.text();
                if (formula.startsWith('=')) {
                    var pos = App.getCellPosition($target);
                    Selection.insertTextAtCursor(App.toLetters(pos.x + 1) + (pos.y + 1));

                    $target.switchClassTo('formula_focused');
                } else {
                    App.stopRecordingFormula();
                }
                //console.log();
            } else {
                App.setFocus($target);
            }
        }
    },
    onTableMouseDown: function (e) {
        if (!App.recordingFormula) {
            e.preventDefault() // если ничего не записываем, то бывает лишнее выделение появляется, это его отключает.
        } else if (!e.target.classList.contains('editable')) {
            e.preventDefault(); //Если записываем надо, чтобы курсор устанавливался в активное поле ввода, и не устанавливался в другие
        }
    }
};

$(App.ready);