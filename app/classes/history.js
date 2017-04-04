function History() {
    // Actions is stored as a queue with the most recent action at the end (index length-1)
    // To outsiders, it is returned as an array with the most recent action at the front (index 0)
    this.actions = [];

    this.addAction = function(action) {
        action = Syntree.Lib.checkArg(action, 'action');

        this.actions.push(action);
    }

    this.popAction = function() {
        return this.actions.pop();
    }

    this.getLast = function() {
        return this.actions[this.actions.length-1];
    }

    this.getAll = function() {
        return this.actions.slice().reverse();
    }

    this.getAllByType = function(type) {
        type = Syntree.Lib.checkArg(type, 'string');

        var filtered = this.actions.filter(function(value) {
            return value.type === type;
        });
        return filtered.slice().reverse();
    }

    this.getLastOfType = function(type) {
        type = Syntree.Lib.checkArg(type, 'string');

        var actions = this.getByType(type);
        return actions[actions.length-1];
    }

    this.getNthOfType = function(type,n) {
        type = Syntree.Lib.checkArg(type, 'string');
        n = Syntree.Lib.checkArg(n, 'number', 0);

        var actions = this.getByType(type);
        return actions[actions.length - (n+1)]
    }

    this.undo = function() {
        var all = this.getAll();
        for (i=0; i<all.length; i++) {
            if (typeof all[i].undo !== 'undefined') {
                this.removeAction(all[i]);
                all[i].undo();
                return;
            }
        }
    }

    this.removeAction = function(a) {
        a = Syntree.Lib.checkArg(a, 'action');

        if (typeof a === 'object') {
            this.actions.splice(this.actions.indexOf(a),1);
        }
    }
}

History.prototype.toString = function() {
    return "[object History]"
};