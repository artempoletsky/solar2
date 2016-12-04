describe("Cell", function () {
    it('should show loop error', function () {

        var a1 = new Cell($.make('div'), "A1");
        var b1 = new Cell($.make('div'), "B1");
        var c1 = new Cell($.make('div'), "C1");

        a1.setFormula('=B1');
        b1.setFormula('=C1');
        c1.setFormula('=A1');
        expect(a1.loopError).toBe(true, 1);
        expect(b1.loopError).toBe(true, 2);
        expect(c1.loopError).toBe(true, 3);

        c1.setFormula('2');
        expect(c1.value).toEqual(2);
        expect(a1.value).toEqual(2);
        expect(b1.value).toEqual(2);
        expect(a1.loopError).toBe(false, 4);
        expect(b1.loopError).toBe(false, 5);
        expect(c1.loopError).toBe(false, 6);

        c1.setFormula('=A1');
        expect(a1.loopError).toBe(true, 7);
        expect(b1.loopError).toBe(true, 8);
        expect(c1.loopError).toBe(true, 9);
    });


    it('should show loop error 2', function () {
        var a1 = new Cell($.make('div'), "A1");
        var b1 = new Cell($.make('div'), "B1");
        var c1 = new Cell($.make('div'), "C1");

        b1.setFormula('=C1');
        c1.setFormula('=B1');

        expect(b1.loopError).toBe(true, 1);
        expect(c1.loopError).toBe(true, 2);


        a1.setFormula('=B1');
        expect(a1.loopError).toBe(true, 3);


    });
});
