/**
 * @constructor
 * @classdesc An element in Syntree is any object that has a graphical representation and is related to the data of the tree. For example, a Node is an element, but the toolbar is not. Elements are Syntree.Node, Syntree.Branch, and Syntree.Arrow.
 */
Syntree.Element = function() {

    if (!Syntree.Lib.checkType(this.id, 'number')) {
        /**
         * A session-unique id.
         * @type {number}
         */
        this.id = Syntree.Lib.genId();
    }

    // Accessor functions

    /**
     * Accessor function for property id.
     * @returns {number} the id of the element
     * @see Syntree.Element.id
     */
    this.getId = function() {
        return this.id;
    }

    /**
     * Accessor function for property deleted.
     *
     * @returns {boolean} whether or not the element is deleted
     * @see Syntree.Element.deleted;
     */
    this.isDeleted = function() {
        return this.deleted;
    }
    // -------------------

    /**
     * Whether or not this element has been deleted.
     * Needed to avoid double deletion.
     *
     * @type {boolean}
     */
    this.deleted = false;

    /**
     * Delete the element.
     * Removes graphical elements, deregisters from Syntree.ElementsManager, and sets deleted property to true.
     * Extend in sub-classes with '__delete()'.
     *
     * @see Syntree.Element#deleted
     * @see Syntree.Element#isDeleted
     */
    this.delete = function() {
        if (this.deleted) {
            return;
        }
        if (Syntree.Lib.checkType(this.__delete, 'function')) {
            this.__delete();
        }
        this.graphic.delete();
        Syntree.ElementsManager.deregister(this);
        this.deleted = true;
    }

    /**
     * Update the elements graphical representation.
     * Mostly serves as a wrapper for Syntree.Graphic.update.
     * Extend in sub-classes with '__updateGraphics()'.
     *
     * @see Syntree.Graphic
     */
    this.updateGraphics = function() {
        this.graphic.update();
        if (Syntree.Lib.checkType(this.__updateGraphics, 'function')) {
            this.__updateGraphics(true);
        }
    }

    /**
     * Whether or not this element is selectable.
     * Selectable elements are Syntree.Node, Syntree.Branch, Syntree.Arrow.
     *
     * @returns {boolean}
     */
    this.isSelectable = function() {
        return false;
    }

    /**
     * Whether or not this object is an element.
     * Elements are Syntree.Node, Syntree.Branch, Syntree.Arrow.
     *
     * @returns {boolean}
     */
    this.isElement = function() {
        return true;
    }

    /**
     * Whether or not this element is deletable.
     * Deletable elements are Syntree.Node, Syntree.Branch, Syntree.Arrow.
     * Syntree.Branch should never be deletable directly by the user.
     * Branches should only be deleted automatically when their child node is deleted.
     *
     * @see Syntree.Node.__delete
     * @returns {boolean}
     */
    this.isDeletable = function() {
        return true;
    }

    Syntree.ElementsManager.register(this);
    this.createGraphic();
}