$(function () {

    var $cellTempl = $('.table_cell');

    var $table = $('.main_table');

    function drawTable(width, height) {
        $table.empty();
        for (var i = 0; i < height; i++) {
            var $tr = $.make('tr');
            for (var j = 0; j < width; j++) {
                var $td = $.make('td');
                $tr.append($td.append($cellTempl.clone()));
            }
            $table.append($tr);
        }
    }

    drawTable(10, 10);


    function toLetters(num) {
        var mod = num % 26;
        var pow = num / 26 | 0;
        var out = mod ? String.fromCharCode(64 + mod) : (pow--, 'Z');
        return pow ? toLetters(pow) + out : out;
    }

    function fromLetters(str) {
        var out = 0,
            len = str.length,
            pos = len;
        while ((pos -= 1) > -1) {
            out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - 1 - pos);
        }
        return out;
    }

    $('body').on('keydown', function (e) {
        //console.log(e);
        if (recordingFormula && e.keyCode == 13) {
            e.preventDefault();

            var pos = getPosition($('.editable'));
            stopRecordingFormula();
            setFocus(pos.x, pos.y + 1);
        }
    });

    function getCellByPosition(x, y) {
        return $table.children().eq(y).children().eq(x).children().eq(0);
    };

    function setFocus(x, y) {
        var $cell;
        if (y) {
            $cell = getCellByPosition(x, y);
        } else {
            $cell = $(x);
        }
        $('.table_cell.focused').removeClass('focused');
        $cell.addClass('focused');
    };

    var variableExp = /([A-Z]+)(\d+)/ig;

    //name = AA11 etc
    function getCellByName(name) {
        name = name.toUpperCase();
        variableExp.lastIndex = 0;
        var res = variableExp.exec(name);

        var x = fromLetters(res[1]) - 1;
        var y = res[2] - 1;

        return getCellByPosition(x, y);
    };



    function getCellValue($cell) {
        var formula = $cell.data('formula');

        if (!formula) {
            return 0;
        }

        variableExp.lastIndex = 0;
        formula = formula.replace(variableExp, function (cell) {
            return getCellValue(getCellByName(cell));
        });

        formula = $.trim(formula, '=');


        return eval(formula);
    };


    function stopRecordingFormula() {
        var $editable = $('.editable')
            .removeAttr('contenteditable')
            .removeClass('editable');
        var formula = $editable.html();
        $editable.data('formula', formula);

        $editable.html(getCellValue($editable));
        Selection.clear();
        recordingFormula = false;
    }

    function getPosition($cell) {
        var $parent = $cell.parent();
        return {
            x: $parent.index(),
            y: $parent.parent().index()
        };
    };


    var recordingFormula = false;
    var recordingPosition;
    $table.on('click', function (e) {
        if (e.target.className == 'table_cell') {
            var $target = $(e.target);


            if (recordingFormula) {

                var $editable = $('.editable');
                var formula = $editable.html();
                if (formula.startsWith('=')) {
                    var pos = getPosition($target);

                    Selection.insertTextAtCursor(toLetters(pos.x + 1) + (pos.y + 1));
                } else {
                    stopRecordingFormula();
                }
                //console.log();
            } else {
                setFocus($target);
            }
        }
    });

    $table.on('mousedown', function (e) {
        if (!recordingFormula) {
            e.preventDefault() // если ничего не записываем, то бывает лишнее выделение появляется, это его отключает.
        } else if (!e.target.classList.contains('editable')) {
            e.preventDefault(); //Если записываем надо, чтобы курсор устанавливался в активное поле ввода, и не устанавливался в другие
        }
    });

    $table.on('dblclick', function (e) {
        //console.log(e.target);
        if (e.target.classList.contains('table_cell')) {

            var $target = $(e.target);
            $('.table_cell.focused').removeClass('focused');
            $target
                .attr('contenteditable', 'true')
                .addClass('editable')
                .focus();

            recordingPosition = getPosition($target);
            recordingFormula = true;
        }
    });
});