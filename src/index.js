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
     * @type Cell
     * current editable cell
     */
    recordingCell: undefined,
    /**
     * All cells
     */
    cache: {},

    /**
     * App entry point
     */
    ready: function () {
        App.$cellTempl = $('.table_cell');
        App.$table = $('.main_table');
        App.drawTable(50, 300);

        $('body').on('keydown', App.onKeyDown);

        App.$table.on('click', App.onTableClick);
        App.$table.on('mousedown', App.onTableMouseDown);
        App.$table.on('dblclick', App.startRecordingFormula);


        var $save = $('.save_button').on('click', ()=> {
            var data = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(App.serialize()));
            $save.attr('href', data);
        });

        var $load = $('.file_hidden').on('change', ()=> {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = JSON.parse(e.target.result);
                App.loadTable(data);
            };
            reader.readAsBinaryString($load.el[0].files[0]);
        });
    },

    loadTable: function (data) {
        for (var name in this.cache) {
            var cell = this.cache[name];
            var formula = data[cell.name] || '';
            cell.formula = formula;
            cell.update();
        }
    },
    serialize: function () {
        var data = {};
        for (var name in this.cache) {
            var formula = this.cache[name].formula;
            if (formula != '') {
                data[name] = formula;
            }
        }
        return data;
    },

    startRecordingFormula: function () {
        var $target = $('.table_cell.focused').removeClass('focused');


        var pos = App.getCellPosition($target);

        var cell = App.getCellByPosition(pos);
        var f = cell.formula;
        if (f) {
            $target.html(f);
        }


        $target
            .attr('contenteditable', 'true')
            .addClass('editable')
            .focus();


        App.recordingCell = cell;
        App.recordingFormula = true;
    },
    drawTable: function (width, height) {
        this.$table.empty();
        App.cache = {};
        for (var i = 0; i < height; i++) {
            var $tr = $.make('tr');
            for (var j = 0; j < width; j++) {
                var $td = $.make('td');

                var cell = new Cell(this.$cellTempl.clone(), {
                    x: j,
                    y: i
                });
                App.cache[cell.name] = cell;
                $tr.append($td.append(cell.$el));
            }
            this.$table.append($tr);
        }
    },

    onKeyDown: function (e) {
        if (App.recordingFormula && e.keyCode == 13) {
            e.preventDefault();

            var pos = App.recordingCell.position;
            App.stopRecordingFormula();
            App.setFocus({
                x: pos.x,
                y: pos.y + 1
            });
        }
    },
    stopRecordingFormula: function () {
        var cell = App.recordingCell
        var $cell = cell.$el
            .removeAttr('contenteditable')
            .removeClass('editable');

        var formula = $cell.text();

        $('.formula_focused').removeClass('formula_focused');

        cell.setFormula(formula);

        Selection.clear();
        App.recordingFormula = false;
    },
    setFocus: function (position) {
        var $cell;
        if (position.x) {
            $cell = this.getCellByPosition(position).$el;
        } else {
            $cell = $(position);
        }

        $cell.switchClassTo('focused');
    },
    getCellByPosition: function (position) {
        return this.cache[Cell.positionToName(position)]
    },


    updateCells: function (reverseDeps) {
        for (var name in reverseDeps) {
            var cell = App.cache[name];
            cell.update();
            App.updateCells(cell.reverseDeps);
        }
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
                    Selection.insertTextAtCursor(Cell.positionToName(pos));

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