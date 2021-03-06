Syntree.config_maps.tree = {};
Syntree.config_maps.tree.accept_unmapped_config = false;
Syntree.config_maps.tree.map = {
    /**
     * Unique identifier, only used for trees you're going to save.
     *
     * @type {number}
     *
     * @see Syntree.Lib.genId
     *
     * @memberof Syntree.Tree
     * @instance
     */
    id: {
        require: 'number',
        default_value: '#undefined',
    },
    /**
     * How much vertical space to have between parent/child nodes.
     *
     * @type {number}
     *
     * @memberof Syntree.Tree
     * @instance
     */
    rowHeight: {
        require: 'number',
        default_value: 70,
    },
    /**
     * The root node of this Tree.
     *
     * @type {Syntree.Node}
     *
     * @memberof Syntree.Tree
     * @instance
     */
    root: {
        require: 'node',
        default_value: '#undefined',
    },
    /**
     * At construction time, a treestring to build this tree out of.
     *
     * @type {string}
     *
     * @see Syntree.Tree#_buildFromTreestring
     *
     * @memberof Syntree.Tree
     * @instance
     */
    build_treestring: {
        require: 'string',
        default_value: '#undefined',
    },
}


/**
 * @class
 * @classdesc Analogous to a linked list class, Tree is actually just a wrapper around some nodes which are linked to one another internally. Tree only stores a reference to the root node, and access all descendants through that link.
 */
Syntree.Tree = function(config_matrix) {
    Syntree.Lib.config(config_matrix, this);

    if (!Syntree.Lib.checkType(this.build_treestring, 'string') && !Syntree.Lib.checkType(this.root, 'node')) {
        throw new Error ('You must provide a root node or a treestring when making a new Tree instance');
    }

    if (Syntree.Lib.checkType(this.build_treestring, 'string')) {
        this._buildFromTreestring(this.build_treestring);
    }

    /**
     * The Node properties that should be included in this tree's treestring.
     *
     * @type {object}
     *
     * @see Syntree.Tree#_buildFromTreestring
     */
    this.node_properties_to_save = {
        id: function(n) {
            return n.getId();
        },
        children: function(n) {
            if (n.getChildren().length > 0) {
                return n.getChildren().map(function(c){
                    return c.getId()
                });
            }
        },
        parent: function(n) {
            if (Syntree.Lib.checkType(n.getParent(), 'node')) {
                return n.getParent().getId();
            }
        },
        labelContent: function(n) {
            return n.getLabelContent();
        },
    };
}

/**
 * Accessor function for Tree.id.
 *
 * @see Syntree.Tree#id
 */
Syntree.Tree.prototype.getId = function() {
    return this.id;
}

/**
 * Setter function for Tree.id.
 *
 * @param {number} id - new id
 *
 * @see Syntree.Tree#id
 */
Syntree.Tree.prototype.setId = function(id) {
    id = Syntree.Lib.checkArg(id, 'number');
    this.id = id;
}

/**
 * Accessor function for Tree.root
 *
 * @see Syntree.Tree#root
 */
Syntree.Tree.prototype.getRoot = function() {
    return this.root;
}

/**
 * Get an SVG path that outlines this Tree.
 *
 * @param {string} which - 'left' or 'right' for which side of this Tree to outline, defaults to both sides
 *
 * @returns {object} - the path string, along with the visual bounds of the Tree.
 */
Syntree.Tree.prototype._getPath = function(which) {
    which = Syntree.Lib.checkArg(which, 'string', '#undefined');

    var toReturn = {};

    if (Syntree.Lib.checkType(which, 'undefined')) {
        var Left = true;
        var Right = true;
    } else {
        var Left = (which === 'left');
        var Right = (which === 'right');
    }

    var rootBBox = this.root.getLabelBBox();
    var rootPos = this.root.getPosition();
    var Y = rootPos.y - (rootBBox.h / 2);
    toReturn.topBound = Y;
    toReturn.bottomBound = Y + rootBBox.h;

    if (Right) {
        var rX = rootPos.x - (rootBBox.w / 2);
        var rPathString = 'M' + rX + ',' + Y;
        rPathString += 'H' + (rootPos.x + (rootBBox.w / 2));
        var rX = rootPos.x + (rootBBox.w / 2);
        var rBound = rX;
    }

    if (Left) {
        var lX = rootPos.x + (rootBBox.w / 2);
        var lPathString = 'M' + lX + ',' + Y;
        lPathString += 'H' + (rootPos.x - (rootBBox.w / 2));
        var lX = rootPos.x - (rootBBox.w / 2);
        var lBound = lX;
    }

    var lastNodes;

    var row = 1;
    while (true) {
        var rowNodes = this.getNodesByOffset(row);
        if (rowNodes.length === 0) {
            lastNodes = this.getNodesByOffset(row - 1);
            break;
        }

        if (Right) {
            var rNode = rowNodes[rowNodes.length - 1];
            var rPos = rNode.getPosition();
            var rBBox = rNode.getLabelBBox();
            var newRX = rPos.x + (rBBox.w / 2);

            if (newRX < rX) {
                rPathString += 'V' + (rPos.y - (rBBox.h / 2));
                rPathString += 'H' + (rPos.x + (rBBox.w / 2));
            } else {
                rPathString += 'H' + (rPos.x + (rBBox.w / 2));
                rPathString += 'V' + (rPos.y - (rBBox.h / 2));
            }

            rX = newRX;
            if (rX > rBound) {
                rBound = rX;
            }
            var rBotBound = (rPos.y + (rBBox.h / 2));
        }

        if (Left) {
            var lNode = rowNodes[0];
            var lPos = lNode.getPosition();
            var lBBox = lNode.getLabelBBox();
            var newLX = lPos.x - (lBBox.w / 2);

            if (newLX > lX) {
                lPathString += 'V' + (lPos.y - (lBBox.h / 2));
                lPathString += 'H' + (lPos.x - (lBBox.w / 2));
            } else {
                lPathString += 'H' + (lPos.x - (lBBox.w / 2));
                lPathString += 'V' + (lPos.y - (lBBox.h / 2));
            }

            lX = newLX;
            if (lX < lBound) {
                lBound = lX;
            }
            var lBotBound = (lPos.y + (lBBox.h / 2));
        }
        toReturn.bottomBound = Math.max(rBotBound, lBotBound);
        row++;
    }

    var lNode = lastNodes[0];
    var rNode = lastNodes[lastNodes.length - 1];
    var lPos = lNode.getPosition();
    var rPos = rNode.getPosition();
    var lBBox = lNode.getLabelBBox();
    var rBBox = rNode.getLabelBBox();

    if (Right) {
        rPathString += 'V' + (rPos.y + (rBBox.h / 2));
        rPathString += 'H' + (lPos.x - (lBBox.w / 2));
    }
    if (Left) {
        lPathString += 'V' + (lPos.y + (lBBox.h / 2));
        lPathString += 'H' + (rPos.x + (rBBox.w / 2));
    }

    if (Left && Right) {
        toReturn.pathString = lPathString + rPathString;
        toReturn.rightBound = rBound;
        toReturn.leftBound = lBound;
    } else if (Right) {
        toReturn.pathString = rPathString;
        toReturn.rightBound = rBound;
    } else if (Left) {
        toReturn.pathString = lPathString;
        toReturn.rightBound = rBound;
    }
    return toReturn;
}

/**
 * Get all descendants of the specified Node.
 *
 * @param {Syntree.Node} [node=this.root]
 * @param {string} [attr=''] - the attr used to represent each Node
 * @param {boolean} [inclusive=true] - include the starting Node in the results?
 * @param {boolean} [flat=false] - squash everything down into a flat array of Nodes
 *
 * @returns {object[]|Syntree.Node[]} - either an array of Nodes, or an array of objects containing more arrays represnting the descendant structure
 */
Syntree.Tree.prototype.getDescendantsOf = function(node, attr, inclusive, flat) {
    node = Syntree.Lib.checkArg(node, 'node', this.root);
    node = Syntree.Lib.checkArg(node, 'node');
    attr = Syntree.Lib.checkArg(attr, 'string', '');
    inclusive = Syntree.Lib.checkArg(inclusive, 'boolean', true);
    flat = Syntree.Lib.checkArg(flat, 'boolean', false);

    var getAttr;
    switch (attr) {
        case 'id':
            getAttr = '.getId()';
            break;
        case 'labelContent':
            getAttr = '.getLabelContent()';
            break;
        case 'editing':
        case 'selected':
        case 'real':
            getAttr = '.getState("' + attr + '")';
            break;
        case 'x':
        case 'y':
            getAttr = '.getPosition().' + attr;
            break;
        default:
            getAttr = '';
    }

    var result = [];
    var len = node.getChildren().length;
    var i = 0;

    while (i < len) {
        var thisChild = node.getChildren()[i];
        if (!flat) {
            var toAdd = {};
            toAdd[eval('thisChild' + getAttr)] = this.getDescendantsOf(thisChild, attr, false);
            result.push(toAdd);
        } else {
            var toAdd = [eval('thisChild' + getAttr)];
            toAdd = toAdd.concat(this.getDescendantsOf(thisChild, attr, false, true));
            result = result.concat(toAdd);
        }
        i = i + 1;
    }

    if (inclusive) {
        if(!flat) {
            var t = eval('node' + getAttr);
            temp = {};
            temp[t] = result;
            result = [temp];
        } else {
            result.unshift(eval('node' + getAttr));
        }
    }

    return result;
}

/**
 * Get a Node's offset from a given Node.
 *
 * @param {Syntree.Node} fromNode - the Node to check from
 * @param {Syntree.Node} toNode - the Node to check to
 *
 * @returns {number} - how many levels between fromNode and toNode
 */
Syntree.Tree.prototype.getNodeOffset = function(fromNode, toNode) {
    fromNode = Syntree.Lib.checkArg(fromNode, 'node');
    toNode = Syntree.Lib.checkArg(toNode, 'node');

    if (fromNode === toNode) {
        return 0;
    }

    var currNode = toNode;
    var off = 1;
    while (true) {
        var parent = currNode.getParent();
        if (parent === fromNode) {
            break;
        } else {
            off++;
            currNode = parent;
        }
    }
    return off;
}

/**
 * Get all Nodes at a specified offset from a given Node.
 *
 * @param {number} off - what offset to return Nodes from
 * @param {Syntree.Node} [node=this.root] - the Node to search from
 */
Syntree.Tree.prototype.getNodesByOffset = function(off, node) {
    // Adapted from http://stackoverflow.com/questions/13523951/how-to-check-the-depth-of-an-object Kavi Siegel's answer
    off = Syntree.Lib.checkArg(off, 'number');
    node = Syntree.Lib.checkArg(node, 'node', this.getRoot());

    if (off == 0) {
        return [node];
    }

    var result = [];
    var children = node.getChildren();
    var c = 0;

    while(c < children.length) {
        if (off === 0) {
            result.push(children[c]);
        } else {
            result = result.concat(this.getNodesByOffset(off - 1, children[c]));
        }
        c++;
    }
    return result;
}

/**
 * Get a treestring for this Tree.
 * A treestring contains all information required to describe Tree at a data level.
 *
 * @returns {string} - the treestring
 *
 * @see Syntree.Tree#node_properties_to_save
 * @see Syntree.Tree#_buildFromTreestring
 */
Syntree.Tree.prototype.getTreestring = function() {
    var s = '';
    var nodes = this.getDescendantsOf(this.root, '', true, true);
    var i = 0;
    while (i < nodes.length) {
        var node = nodes[i];
        for (p in this.node_properties_to_save) {
            s += p;
            s += ':';
            s += this.node_properties_to_save[p](node);
            s += '|';
        }
        s += ';';
        i++;
    }
    return s;
}

/**
 * Get this Tree as bracket notation.
 *
 * @param {Syntree.Node} [node=this.root] - the Node to start from
 *
 * @returns {string} - bracket notation representing this Tree
 */
Syntree.Tree.prototype.getBracketNotation = function(node) {
    node = Syntree.Lib.checkArg(node, 'node', this.root);
    node = Syntree.Lib.checkArg(node, 'node');

    var string = '[.' + node.getLabelContent();
    var children = node.getChildren();
    if (children.length > 0) {
        var c = 0;
        while (c < children.length) {
            var thisChild = children[c];
            var add = this.getBracketNotation(thisChild);
            string += ' ' + add;
            c++;
        }
    }
    string += ' ]';
    return string;
}

/**
 * Distribute the Nodes in this Tree such that they are spread out nicely and don't collide.
 *
 * @param {number} [angle=60] - the angle to spread Nodes across
 */
Syntree.Tree.prototype.distribute = function(angle) {
    angle = Syntree.Lib.checkArg(angle, 'number', 60);

    var children = this.root.getChildren();
    if (children.length === 0) {
        return;
    } else if (children.length === 1){
        children[0].move(
            this.root.getPosition().x,
            this.root.getPosition().y + this.rowHeight
        );
        children[0].updateGraphics();
    } else if (children.length > 1) {
        var pos = this.root.getPosition();
        var leftBound = pos.x - (this.rowHeight * Math.tan((angle / 2) * (Math.PI / 180)));
        var rightBound = pos.x + (this.rowHeight * Math.tan((angle / 2) * (Math.PI / 180)));
        var width = rightBound - leftBound;
        var interval = width / (children.length - 1);
        var i = 0;
        var targetY = this.root.getPosition().y + this.rowHeight;
        while (i < children.length) {
            var targetX = leftBound + (interval * i);
            children[i].move(leftBound + (interval * i), this.root.getPosition().y + this.rowHeight);
            i++;
        }

        var c = 0;
        var intersect = false;
        var newWidth = width;
        while (c < children.length - 1) {
            var lChild = children[c];
            var rChild = children[c + 1];
            var lNode = new Syntree.Tree({
                root: rChild,
            }).getLeftMostNode();
            var rNode = new Syntree.Tree({
                root: lChild,
            }).getRightMostNode();
            var lBBox = lNode.getLabelBBox();
            var rBBox = rNode.getLabelBBox();
            var lBound = lNode.getPosition().x - (lBBox.w / 2);
            var rBound = rNode.getPosition().x + (rBBox.w / 2);
            if (rBound >= lBound) {
                intersect = true;
                var overlap = rBound - lBound;
                newWidth += Math.abs(overlap);
                newWidth += 20; //padding
            }
            c++;
        }

        if (intersect) {
            var newAngle = 2 * ((180 / Math.PI) * (Math.atan(newWidth / (2 * this.rowHeight))));
            var oldAngle = 2 * ((180 / Math.PI) * (Math.atan(width / (2 * this.rowHeight))));
            this.distribute(newAngle);
        }
    }

    if (Syntree.Lib.checkType(this.root.getParent(), 'node')) {
        var tree = new Syntree.Tree({
            root: this.root.getParent(),
        });
        tree.distribute();
    } else {
        this.root.updateGraphics(true);
    }
}

Syntree.Tree.prototype.getLeftMostNode = function() {
    var node = this.root;
    while (true) {
        if (node.getChildren().length === 0) {
            return node;
        } else {
            node = node.getChildren()[0];
        }
    }
}

Syntree.Tree.prototype.getRightMostNode = function() {
    var node = this.root;
    while (true) {
        if (node.getChildren().length === 0) {
            return node;
        } else {
            node = node.getChildren()[node.getChildren().length-1];
        }
    }
}

/**
 * Delete this Tree.
 */
Syntree.Tree.prototype.delete = function() {
    var nodes = this.getDescendantsOf(this.root, '', true, true);
    var i = 0;
    while (i < nodes.length) {
        nodes[i].delete();
        i++;
    }
}

Syntree.Tree.prototype.toString = function() {
return '[object Tree]'
}

/**
 * Instead of just passively wrapping around the given root Node and its descendants,
 * create nodes and attach them based on data from a treestring.
 *
 * @param {string} treestring - the treestring to use
 *
 * @see Syntree.Tree#build_treestring
 * @see Syntree.Tree#getTreestring
 */
Syntree.Tree.prototype._buildFromTreestring = function(treestring) {
    treestring = Syntree.Lib.checkArg(treestring, 'string');

    var node_entries = (treestring.split(';'));
    node_entries.pop(); // remove trailing item from split
    var node_entry_list = [];
    var i = 0;
    while (i < node_entries.length) {
        var node_config = {};
        var attrs = node_entries[i].split('|');
        var ii = 0;
        while (ii < attrs.length) {
            var name = attrs[ii].split(':')[0];
            var val = attrs[ii].split(':')[1];
            node_config[name] = val;
            ii++;
        }
        node_entry_list.push(node_config);
        i++;
    }
    var rootAttrs = {
        x: $('#workspace').width() / 2,
        y: $('#toolbar').height() + 20,
        labelContent: node_entry_list[0].labelContent,
        id: Number(node_entry_list[0].id),
    }
    this.root = new Syntree.Node(rootAttrs);
    this.root.editingAction('save');

    var n = 1;
    while (n < node_entry_list.length) {
        var entry = node_entry_list[n];
        var newnode = new Syntree.Node({
            labelContent: entry.labelContent,
            id: Number(entry.id),
        });
        Syntree.Lib.allIds.push(newnode.id);
        newnode.editingAction('save');
        n++;
    }
    n = 0;
    while (n < node_entry_list.length) {
        var entry = node_entry_list[n];
        if (entry.children !== 'undefined') {
            var childIds = entry.children.split(',');
            var c = 0;
            while (c < childIds.length) {
                Syntree.Workspace.page.allElements[entry.id].addChild(Syntree.Workspace.page.allElements[childIds[c]]);
                c++;
            }
        }
        var temp = new Syntree.Tree({
            root: Syntree.Workspace.page.allElements[entry.id],
        })
        temp.distribute();
        n++;
    }
}
