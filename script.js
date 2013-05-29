Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

Function.method('curry', function () {
    var slice = Array.prototype.slice,
        args = slice.apply(arguments),
        that = this;
    return function () {
        return that.apply(null, args.concat(slice.apply(arguments)));
    };
});

Array.method('reduce', function (f, value) {
    var i;
    for (i = 0; i < this.length; i += 1) {
        value = f(this[i], value);
    }
    return value;
});

var is_array = function (value) {
    return value &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        typeof value.splice === 'function' &&
        !(value.propertyIsEnumerable('length'));
}

var to_string = function (c) {
    if (typeof c === 'string') return c;
    if (c.length === 1) {
        return to_string(c[0]);
    }
    if (is_array(c[1])) {
        return to_string(c[0]) + "(" + to_string(c[1]) + ")";
    }
    else {
        return to_string(c[0]) + to_string(c[1]);
    }
};

var eval_once = function (c) {
    //console.dir(c);
    if (typeof c === 'string') {
        return {f: c, args: []};
    }
    else {
        var p = eval_once(c[0]), q = eval_once(c[1]);
        // console.log('++++');
        // console.dir(p);
        // console.dir(q);
        if (is_array(p)) return [p, q];
        p.args.push(q);
        if (p.f === 'i' && p.args.length === 1) return [p.args[0]];
        else if (p.f === 'k' && p.args.length === 2) return [p.args[0]];
        else if (p.f === 's' && p.args.length === 3) {
            return [[p.args[0], p.args[2]], [p.args[1], p.args[2]]]
        }
        return p;
    }
};

var expand = function (c) {
    if (is_array(c)) {
        if (c.length === 1) return expand(c[0]);
        return c.map(function (elem) { return expand(elem); });
    }
    else {
        var expand_obj = function (obj) {
            if (obj.args.length === 0) return obj.f;
            return expand_obj({
                f: [obj.f, expand(obj.args[0])],
                args: obj.args.slice(1)
            });
        };
        return expand_obj(c);
    }
};

var add_left = function (term, c) {
    if (typeof term === 'string') return [c, term];
    return [add_left(term[0], c), term[1]];
};

var add_right = function (term, c) {
    if (typeof c === 'string') return [term, c];
    return [add_right(term, c[0]), c[1]];
};

// var d0 = [[['s','i'],'i'],[['s','i'],'i']]
//   , d1 = expand(eval_once(d0))
//   , d2 = expand(eval_once(d1))
//   , d3 = expand(eval_once(d2))

// console.log(to_string(d0));
// console.log(to_string(d1));
// console.log(to_string(d2));
// console.log(to_string(d3));

// console.log('------------------------------------');

// var b0 = [[['s', ['k', 's']], 'k'], 'i']
//   , b1 = expand(eval_once(b0))
//   , b2 = expand(eval_once(b1))
//   , b3 = expand(eval_once(b2));

// console.log(to_string(b1));
// console.log(to_string(b2));
// console.log(to_string(b3));

var generate = function (len) {
    if (len === 1) {
        var r = Math.random()
          , a = 1.0 / 3.0;
        if (r < a) return 's';
        else if (r < 2.0 * a) return 'k';
        else if (r < 3.0 * a) return 'i';
    }
    else {
        var a = Math.floor(Math.random() * (len - 1)) + 1
          , l = generate(a)
          , r = generate(len - a);
        return [l, r];
    }
};

$(function (){
    var term = generate(5)
      , next = generate(2)
      , score = 1000;
    $('#next').text(to_string(next));
    $('#term').text(to_string(term));
    $(window).keydown(function (e) {
        if (e.keyCode === 69) {
            term = expand(eval_once(term));
        }
        else if (e.keyCode === 37) {
            //term = [next, term];
            term = add_left(term, next);
            next = generate(2);
        }
        else if (e.keyCode === 39) {
            //term = [term, next];
            term = add_right(term, next);
            next = generate(Math.floor(Math.random() * 4) + 1);
        }
        $('#next').text(to_string(next));
        $('#term').text(to_string(term));
    });
});
