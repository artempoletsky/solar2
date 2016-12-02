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
            $target
                .attr('contenteditable', 'true')
                .addClass('editable')
                .focus();

            App.recordingPosition = App.getPosition($target);
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

            var pos = App.getPosition($('.editable'));
            App.stopRecordingFormula();
            App.setFocus(pos.x, pos.y + 1);
        }
    },
    stopRecordingFormula: function () {
        var $editable = $('.editable')
            .removeAttr('contenteditable')
            .removeClass('editable');
        var formula = $editable.html();
        $editable.data('formula', formula);

        $editable.html(App.getCellValue($editable));
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
        $('.table_cell.focused').removeClass('focused');
        $cell.addClass('focused');
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
    getCellValue: function ($cell) {
        var formula = $cell.data('formula');

        if (!formula) {
            return 0;
        }

        this.variableExp.lastIndex = 0;
        formula = formula.replace(this.variableExp, function (cell) {
            return App.getCellValue(this.getCellByName(cell));
        });

        formula = $.trim(formula, '=');


        return eval(formula);
    },

    getCellValue: function ($cell) {
        var formula = $cell.data('formula');

        if (!formula) {
            return 0;
        }

        this.variableExp.lastIndex = 0;
        formula = formula.replace(this.variableExp, function (cell) {
            return App.getCellValue(App.getCellByName(cell));
        });

        formula = $.trim(formula, '=');


        return eval(formula);
    },

    getPosition: function ($cell) {
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
                var formula = $editable.html();
                if (formula.startsWith('=')) {
                    var pos = App.getPosition($target);

                    Selection.insertTextAtCursor(App.toLetters(pos.x + 1) + (pos.y + 1));
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