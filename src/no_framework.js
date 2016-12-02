$ = function (selector) {
    if (typeof selector == 'function') {
        $.ready(selector)
    } else if (selector instanceof $__) {
        return selector;
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

$.fn.eq = function (index) {
    return $(this.el[index]);
};

$.fn.children = function () {
    return $(this.el[0].childNodes);
};

$.fn.index = function () {
    var el = this.el[0];
    return $.toArray(el.parentNode.childNodes).indexOf(el);
};

$.fn.html = function () {
    if (arguments.length) {
        this.el.forEach(el => el.innerHTML = arguments[0]);
        return this;
    } else {
        try {
            return this.el[0].innerHTML;
        } catch (e) {
            debugger;
        }

    }
};

$.fn.focus = function () {
    this.el[0].focus();
    return this;
};

$.make = function (tagName) {
    return $(document.createElement(tagName));
};

$.fn.addClass = function (className) {
    this.el.forEach(function (el) {
        el.classList.add(className);
    });
    return this;
};

$.fn.removeClass = function (className) {
    this.el.forEach(function (el) {
        el.classList.remove(className);
    });
    return this;
};

$.fn.toggleClass = function (className, cond) {
    this.el.forEach(function (el) {
        el.classList.toggle(className, cond);
    });
    return this;
};

$.fn.empty = function () {
    this.el.forEach(function (el) {
        while (el.childNodes.length) {
            el.removeChild(el.childNodes[0]);
        }
    });
    return this;
};

$.fn.on = function (event_name, callback) {

    this.el[0].addEventListener(event_name, callback);
    return this;
};

$.toArray = function (nodeList) {
    if (nodeList instanceof NodeList || nodeList instanceof Array) {
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
$.fn.parents = function (className) {
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
    } else {
        return $();
    }
};

$.fn.parent = function () {
    return $(this.el[0].parentNode);
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

$.fn.removeAttr = function (key) {
    this.el.forEach(function (el) {
        el.removeAttribute(key);
    });
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


var Selection = {
    insertTextAtCursor: function (text) {
        var sel, range, html;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(text));
            }
        } else if (document.selection && document.selection.createRange) {
            document.selection.createRange().text = text;
        }
    },
    clear: function () {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE?
            document.selection.empty();
        }
    }
};