$ = function (selector) {
    if (typeof selector == 'function') {
        $.ready(selector)
    } else {
        return new $__(selector);
    }
};

$__ = function (selector) {
    if (!selector) {
        this.el = [];
    } else if (typeof selector == 'string') {
        this.el = $.toArray(document.querySelectorAll(selector))
    } else {
        this.el = $.toArray(selector);
    }
};

$.fn = $__.prototype;

$.fn.on = function (event_name, callback) {

    this.el[0].addEventListener(event_name, callback);
    return this;
};

$.toArray = function (nodeList) {
    if(nodeList instanceof NodeList|| nodeList instanceof Array){
        return [].slice.call(nodeList);
    }
    return [nodeList];
};

$.fn.val = function () {
    if (arguments.length) {
        this.el[0].value = arguments[0];
        return this;
    } else {
        return this.el[0].value;
    }
};

//ищет только по класснейму, а не селектору
$.fn.parent = function (className) {
    var el = this.el[0];
    var found = false;
    while (el.parentNode) {
        el = el.parentNode;
        if (el.className == className) {
            found = true;
            break;
        }
    }

    if (found) {
        return $(el);
    }else {
        return $();
    }
};

$.fn.find = function (selector) {
    var result = $();
    this.el.forEach(function (el) {
        result.el = result.el.concat($.toArray(el.querySelectorAll(selector)));
    });
    return result;
};

$.fn.attr = function (key, value) {
    if (value !== undefined) {
        this.el.forEach(function (el) {
            el.setAttribute(key, value);
        })
    } else {
        return this.el[0].getAttribute(key);
    }
    return this;
};

$.fn.clone = function () {
    return $([this.el[0].cloneNode(true)]);
};

$.fn.append = function (elem) {
    if (elem.el) {
        elem = elem.el;
    }
    var parent = this.el[0];
    if (!elem.length) {
        elem = [elem];
    }
    for (var i = 0; i < elem.length; i++) {
        parent.appendChild(elem[i]);
    }
    return this;
};

$.fn.remove = function () {
    this.el.forEach(function (el) {
        el.parentNode.removeChild(el);
    });
    return this;
};

$.ready = function (callback) {
    document.addEventListener("DOMContentLoaded", callback);
};