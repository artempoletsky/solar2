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

    $table.on('click', function (e) {
        console.log(e.target);
    });
});