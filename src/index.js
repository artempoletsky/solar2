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

        $(window).on('resize', function () {
            App.renderTH();
        });

        App.$scrollViewPort = $('.table_view_port').scroll($.debounce(App.onScroll, 20, App));
        //App.scroll_deaf = false;


        App.$thx = $('.thx');
        App.$thy = $('.thy');


        App.drawTable(50, 300);
    },

    cellWidth: 101,
    cellHeight: 21,

    resetScroll: function () {
        App.onScroll(0, 0);
    },

    onScroll: function (left, top) {
        //if (!App.scroll_deaf) {

        App.scrollX = Math.ceil(left / App.cellWidth);
        App.scrollY = Math.ceil(top / App.cellHeight);

        var el = App.$scrollViewPort.el[0];
        //App.scroll_deaf = true;
        el.scrollLeft = App.scrollX * App.cellWidth;
        el.scrollTop = App.scrollY * App.cellHeight;

        App.renderTH();
        /*} else {
         setTimeout(function(){
         App.scroll_deaf = false;
         },20);
         }*/

    },

    renderTH: function () {
        App.$thx.empty();
        App.$thy.empty();
        var width = App.$scrollViewPort.width() / App.cellWidth;
        var height = App.$scrollViewPort.height() / App.cellHeight;


        for (var i = 0; i < width; i++) {
            App.$thx.append($.make('div').html(Cell.toLetters(App.scrollX + i + 1)));
        }

        for (var i = 0; i < height; i++) {
            App.$thy.append($.make('div').html(App.scrollY + i + 1));
        }
    },

    loadTable: function (data) {
        for (var name in Cell.cache) {
            var cell = Cell.cache[name];
            var formula = data[cell.name] || '';
            cell.setFormula(formula);
        }
        App.resetScroll();
    },
    serialize: function () {
        var data = {};
        for (var name in Cell.cache) {
            var formula = Cell.cache[name].formula;
            if (formula != '') {
                data[name] = formula;
            }
        }
        return data;
    },

    startRecordingFormula: function () {
        var $target = $('.table_cell.focused').removeClass('focused');
        if (!$target.el[0]) {
            return;
        }


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
        Cell.cache = {};
        for (var i = 0; i < height; i++) {
            var $tr = $.make('tr');
            for (var j = 0; j < width; j++) {
                var $td = $.make('td');

                var cell = new Cell(this.$cellTempl.clone(), {
                    x: j,
                    y: i
                });
                $tr.append($td.append(cell.$el));
            }
            this.$table.append($tr);
        }

        App.resetScroll();
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
        var cell = App.recordingCell;
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
        if (position.x !== undefined) {
            $cell = this.getCellByPosition(position).$el;
        } else {
            $cell = $(position);
        }

        $cell.switchClassTo('focused');
    },
    getCellByPosition: function (position) {
        return Cell.cache[Cell.positionToName(position)]
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