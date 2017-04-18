/**
 * @class
 * @classdesc An element that the user can click on and select. Selectable elements are Syntree.Node, Syntree.Branch, and Syntree.Arrow.
 * @extends Syntree.Element
 */
Syntree.SelectableElement = function() {
    Syntree.Element.call(this);

    /**
     * Whether or not this element is selected.
     *
     * @type {boolean}
     * @see Syntree.SelectableElement#isSelected
     * @see Syntree.SelectableElement#select
     */
    this.selected = false;

    /**
     * Select the element.
     * Controls the appearance and behavior of <strong>this element only</strong>.
     * Deselecting previously selected element and other overarching management is handled by Syntree.ElementsManager.
     *
     * @see Syntree.SelectableElement#isSelected
     * @see Syntree.SelectableElement#selected
     * @see Syntree.ElementsManager
     */
    this.select = function() {
        if (Syntree.Lib.checkType(this.__select, 'function')) {
            this.__select();
        }
        this.selected = true;
        this.graphic.unsync('selected');
        this.updateGraphics(false);
    }

    /**
     * Deselect the element.
     * Controls the appearance and behavior of <strong>this element only</strong>.
     * Other overarching management is handled by Syntree.ElementsManager.
     *
     * @see Syntree.SelectableElement#isSelected
     * @see Syntree.SelectableElement#selected
     * @see Syntree.ElementsManager
     */
    this.deselect = function() {
        if (Syntree.Lib.checkType(this.__deselect, 'function')) {
            this.__deselect();
        }
        this.selected = false;
        this.graphic.unsync('selected');
        this.updateGraphics(false);
    }

    this.isSelectable = function() {
        return true;
    }
}