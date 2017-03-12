/**
 * wasavi: vi clone implemented in javascript
 * =============================================================================
 *
 *
 * @author akahuku@gmail.com
 */
/**
 * Copyright 2012-2017 akahuku, akahuku@gmail.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (g) {

'use strict';

/*
 * prototype extension
 * ----------------
 */

Object.defineProperties(Array.prototype, {
	firstItem: {
		get:function () {return this[0]},
		set:function (v) {
			if (this.length) {
				this[0] = v;
			}
		}
	},
	lastItem: {
		get:function () {return this[this.length - 1]},
		set:function (v) {
			if (this.length) {
				this[this.length - 1] = v;
			}
		}
	}
});

/*
 * utility functions
 * ----------------
 */

// DOM manipulators
g.$ = function (arg) {
	return typeof arg == 'string' ? document.getElementById(arg) : arg;
};
g.docScrollLeft = function () {
	return Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
};
g.docScrollTop = function () {
	return Math.max(document.documentElement.scrollTop, document.body.scrollTop);
};
g.docScrollWidth = function () {
	return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
};
g.docScrollHeight = function () {
	return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
};
g.docClientWidth = function () {
	return Math.min(document.documentElement.clientWidth, document.body.clientWidth)
};
g.docClientHeight = function () {
	return Math.min(document.documentElement.clientHeight, document.body.clientHeight)
};
g.emptyNodeContents = function (node) {
	node = $(node);
	if (!node) return;
	var r = document.createRange();
	r.selectNodeContents(node);
	r.deleteContents();
};
g.removeChild = function () {
	for (var i = 0; i < arguments.length; i++) {
		var elm = $(arguments[i]);
		elm && elm.parentNode && elm.parentNode.removeChild(elm);
	}
};
g.isMultilineTextInput = function (target) {
	return target.nodeName != 'INPUT';
};
g.style = function (src, styles) {
	for (var i in styles) {
		src.style[i] = styles[i];
	}
};

//
g.$call = function () {
	for (var i = 0, goal = arguments.length; i < goal; i++) {
		typeof arguments[i] == 'function' && arguments[i]();
	}
};
g.extend = function (dest, src) {
	for (var p in src) {
		dest[p] = src[p];
	}
	return dest;
};
g.parseJson = function (src) {
	try {
		src = JSON.parse(src);
	}
	catch (e) {
		src = null;
	}
	return src;
};
g.reverseObject = function (o) {
	var result = {};
	for (var i in o) {result[o[i]] = i;}
	return result;
};
g.multiply = function (letter, times) {
	if (letter == '' || times <= 0) return '';
	var result = letter;
	while (result.length < times) {
		result += result;
	}
	return result.length == times ? result : result.substring(0, letter.length * times);
};
g.toVisibleString = function (s) {
	return (s || '')
		.replace(/[\u0000-\u001f\u007f]/g, function (a) {
			return a.charCodeAt(0) == 0x7f ? '^_' : '^' + String.fromCharCode(a.charCodeAt(0) + 64);
		})
		.replace(/\ue000/g, '');
};
g.toVisibleControl = function (s) {
	return typeof s == 'number' ?
		_toVisibleControl(s) :
		(s || '').replace(/[\u0000-\u001f\u007f]/g, function (a) {
			return _toVisibleControl(a.charCodeAt(0));
		});
};
g.toNativeControl = function (s) {
	return typeof s == 'number' ?
		_toNativeControl(s) :
		(s || '').replace(/[\u2400-\u241f\u2421]/g, function (a) {
			return _toNativeControl(a.charCodeAt(0));
		});
};
g._toVisibleControl = function (code) {
	// U+2400 - U+243F: Unicode Control Pictures
	if (code == 0x7f) {
		return String.fromCharCode(0x2421);
	}
	if (code >= 0x00 && code <= 0x1f) {
		return String.fromCharCode(0x2400 + code);
	}
	return String.fromCharCode(code);
};
g._toNativeControl = function (code) {
	if (code == 0x2421) {
		return '\u007f';
	}
	if (code >= 0x2400 && code <= 0x241f) {
		return String.fromCharCode(code & 0x00ff);
	}
	return String.fromCharCode(code);
};
g.trimTerm = function (s, ch) {
	ch || (ch = '\n');
	if (s.length && s.substr(-1) == ch) {
		s = s.substring(0, s.length - 1);
	}
	return s;
};
g.dataset = (function () {
	const nameRegex = /^[a-zA-Z]+$/;
	var datasetNameCache = {};

	function toHyphen (s) {
		s = s.replace(/([a-z])([A-Z])/g, function ($0, $1, $2) {
			return $1 + '-' + $2.toLowerCase();
		});
		return s;
	}
	function getDatasetKey (s) {
		if (s in datasetNameCache) {
			return datasetNameCache[s];
		}
		s = toHyphen(s);
		s = 'data-' + s;
		s = s.toLowerCase();
		datasetNameCache[s] = s;
		return s;
	}

	return function (elm, name) {
		if (arguments.length < 2) {
			throw new Error('dataset: too few arguments.');
		}
		if (!elm) {
			throw new Error('dataset: invalid element.');
		}
		if (!nameRegex.test(name)) {
			throw new Error('dataset: invalid name.');
		}

		name = getDatasetKey(name);

		var result;

		if (arguments.length == 2) {
			result = elm.getAttribute(name);
		}
		else {
			if (arguments[2] === null) {
				elm.removeAttribute(name);
			}
			else {
				result = arguments[2].toString();
				elm.setAttribute(name, result);
			}
		}

		return result;
	};
})();
g._ = function () {
	var args = toArray(arguments);
	var format = args.shift();
	return format.replace(/\{(?:([a-z]+):)?(\d+)\}/ig, function ($0, $1, $2) {
		if ($1 == undefined || $1 == '') {
			return args[$2];
		}
		// simple plural fix for english
		if (args[$2] == 1) {
			return $1;
		}
		if (/[hos]$/.test($1)) {
			return $1 + 'es';
		}
		if (/[^aeiou]y$/i.test($1)) {
			return $1.substr(0, $1.length - 1) + 'ies';
		}
		return $1 + 's';
	});
};
g.getObjectType = function (a) {
    return Object.prototype.toString.call(a).replace(/^\[object\s+|\]$/g, '');
};
g.isObject = function (a) {
	return getObjectType(a) == 'Object';
};
g.isString = function (a) {
	return getObjectType(a) == 'String';
};
g.isNumber = function (a) {
	return getObjectType(a) == 'Number';
};
g.isBoolean = function (a) {
	return getObjectType(a) == 'Boolean';
};
g.isArray = function (a) {
	// TODO: accept ducktyping?
	return getObjectType(a) == 'Array';
};
g.isFunction = function (a) {
	return getObjectType(a) == 'Function';
};
g.publish = function () {
	if (arguments.length < 1) return;
	var target = arguments[0];
	for (var i = 1; i < arguments.length; i++) {
		switch (getObjectType(arguments[i])) {
		case 'Function':
			Object.defineProperty(target, arguments[i].name, {
				value:arguments[i],
				configurable:false,
				enumerable:true,
				writable:false
			});
			break;

		case 'Object':
			for (var j in arguments[i]) {
				switch (getObjectType(arguments[i][j])) {
				case 'Function':
					Object.defineProperty(target, j, {
						get:arguments[i][j],
						configurable:false,
						enumerable:true
					});
					break;
				case 'Array':
					Object.defineProperty(target, j, {
						get:arguments[i][j][0],
						set:arguments[i][j][1],
						configurable:false,
						enumerable:true
					});
					break;
				default:
					Object.defineProperty(target, j, {
						value:arguments[i][j],
						configurable:false,
						enumerable:true,
						writable:false
					});
					break;
				}
			}
			break;
		}
	}
};
g.toArray = function (arg, index) {
	return Array.prototype.slice.call(arg, index || 0);
};
g.expr = function (source) {
	var tokens = [];
	var i = 0;

	function add () {
		var r = mul();
loop:	while (true) {
			switch (tokens[i++]) {
			case '+': r += mul(); break;
			case '-': r -= mul(); break;
			default: --i; break loop;
			}
		}
		return r;
	}
	function mul () {
		var r = fact();
loop:	while (true) {
			switch (tokens[i++]) {
			case '*': r *= fact(); break;
			case '/': r /= fact(); break;
			case '%': r %= fact(); break;
			default: --i; break loop;
			}
		}
		return r;
	}
	function fact () {
		var r = tokens[i++];
		if (r == '(') {
			r = add();
			if (tokens[i++] != ')') {
				throw new Error(_('Missing ")".'));
			}
		}
		else {
			var sign = '';
			if (r == '+' || r == '-') {
				sign = r;
				r = tokens[i++];
			}
			r = parseFloat(sign + r);
			if (isNaN(r)) {
				throw new Error(_('Missing a number.'));
			}
		}
		return r;
	}

	try {
		const regex = /^([()+\-*\/%]|(?:0|[1-9][0-9]*)\.[0-9]*(?:e[+-]?[0-9]+)*|\.[0-9]+(?:e[+-]?[0-9]+)*|(?:0|[1-9][0-9]*)(?:e[+-]?[0-9]+)*|0x[0-9a-f]+)\s*/i;
		var re;

		source = source.replace(/^\s+/, '');
		while ((re = regex.exec(source))) {
			tokens.push(re[1]);
			source = source.substring(re[0].length);
		}
		if (source != '') {
			throw new Error(_('Invalid token: {0}', source.charAt(0)));
		}
		if (tokens.length == 0) {
			return {};
		}

		var result = add();
		if (i < tokens.length) {
			throw new Error(_('Extra token: {0}', tokens[i].charAt(0)));
		}
		return {result: result};
	}
	catch (e) {
		return {error: e.message};
	}
};
g.strftime = (function () {
	var weekdays = {
		long:'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
		short:'Sun Mon Tue Wed Thu Fri Sat'.split(' ')
	};
	var months = {
		long:'January February March April May June July August September October November December'.split(' '),
		short:'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
	};
	var nummap = {
		'_':function (s,w) {return s.length < w ? (multiply(' ', w) + s).substr(-w) : s},
		'-':function (s,w) {return s.replace(/^[ 0]+/, '') || '0'},
		'0':function (s,w) {return s.length < w ? (multiply('0', w) + s).substr(-w) : s}
	};
	var strmap = {
		'^':function (s, format, key) {
			// make the behavior the same as mysterious glibc strftime: P is not capitalized
			if (key == 'P') {
				return s;
			}
			return s.toUpperCase();
		},
		'#':function (s, format, key) {
			if ('aAbBh'.indexOf(key) >= 0) {
				return s.toUpperCase();
			}
			else if ('pPZ'.indexOf(key) >= 0) {
				return s.toLowerCase();
			}
			return s;
		}
	};
	var translators = {
		'%':function () {return '%'},
		a:function (d,l,f,w) {return ff(Intl.DateTimeFormat(l, {weekday:'short'}).format(d), f)},
		A:function (d,l,f,w) {return ff(Intl.DateTimeFormat(l, {weekday:'long'}).format(d), f)},
		b:function (d,l,f,w) {return ff(Intl.DateTimeFormat(l, {month:'short'}).format(d), f)},
		B:function (d,l,f,w) {return ff(Intl.DateTimeFormat(l, {month:'long'}).format(d), f)},
		c:function (d,l,f,w) {return ff(d.toLocaleString(l), f)},
		C:function (d,l,f,w) {return ff(d.getFullYear().toString().substring(0, 2), fixformat(f, '0'), w)},
		d:function (d,l,f,w) {return ff(d.getDate(), fixformat(f, '0'), w || 2)},
		D:function (d,l,f,w) {
			return 'mdy'.split('')
				.map(function(a){return this[a](d, l, a + f.substring(1))}, this)
				.join('/');
		},
		e:function (d,l,f,w) {return ff(d.getDate(), fixformat(f, '_'), w || 2)},
		F:function (d,l,f,w) {
			return 'Ymd'.split('')
				.map(function(a){return this[a](d, l, a + f.substring(1))}, this)
				.join('-');
		},
		g:function (d,l,f,w) {
			return ff((parseInt(this.G(d, l, 'G-', 0), 10)) % 100, fixformat(f, '0'), w || 2)
		},
		G:function (d,l,f,w) {
			var y = d.getFullYear();
			var V = parseInt(this.V(d, l, 'V-', 0), 10);
			var W = parseInt(this.W(d, l, 'W-', 0), 10);
			if (W > V) y++;
			else if (W == 0 && V >= 52) y--;
			return ff(y, fixformat(f, '0'), w || 4);
		},
		h:function (d,l,f,w) {return this.b(d,l,f,w)},
		H:function (d,l,f,w) {return ff(d.getHours(), fixformat(f, '0'), w || 2)},
		I:function (d,l,f,w) {return ff(d.getHours() % 12, fixformat(f, '0'), w || 2)},
		j:function (d,l,f,w) {return ff((Math.ceil((d.getTime() - (new Date(d.getFullYear(), 0, 1)).getTime()) / (24 * 60 * 60 * 1000))), fixformat(f, '0'), w || 3)},
		k:function (d,l,f,w) {return ff(d.getHours(), fixformat(f, '_'), w || 2)},
		l:function (d,l,f,w) {return ff(d.getHours() % 12, fixformat(f, '_'), w || 2)},
		m:function (d,l,f,w) {return ff(d.getMonth() + 1, fixformat(f, '0'), w || 2)},
		M:function (d,l,f,w) {return ff(d.getMinutes(), fixformat(f, '0'), w || 2)},
		n:function (d,l,f,w) {return '\n'},
		p:function (d,l,f,w) {return ff(d.getHours() < 12 ? 'AM' : 'PM', f)},
		P:function (d,l,f,w) {return ff(this.p(d, l, f, w).toLowerCase(), f)},
		r:function (d,l,f,w) {return [this.I(d, l, 'I', 0), ':', this.M(d, l, 'M', 0), ':', this.S(d, l, 'S', 0), ' ', this.p(d, l, 'p', 0)].join('')},
		R:function (d,l,f,w) {
			return 'HM'.split('')
				.map(function(a){return this[a](d, l, a + f.substring(1))}, this)
				.join(':');
		},
		s:function (d,l,f,w) {return ff(Math.floor(d.getTime() / 1000), fixformat(f, '-'), 0)},
		S:function (d,l,f,w) {return ff(d.getSeconds(), fixformat(f, '0'), w || 2)},
		t:function (d,l,f,w) {return '\t'},
		T:function (d,l,f,w) {
			return 'HMS'.split('')
				.map(function(a){return this[a](d, l, a + f.substring(1))}, this)
				.join(':');
		},
		u:function (d,l,f,w) {return ff(d.getDay() == 0 ? 7 : d.getDay(), fixformat(f, '0'), w || 0)},
		U:function (d,l,f,w) {return ff(Math.floor(((parseInt(this.j(d, l, 'j-', 0), 10)) + (6 - d.getDay())) / 7), fixformat(f, '0'), w || 2)},
		V:function (d,l,f,w) {
			var woy = parseInt(this.W(d, l, 'W-', 0), 10);
			var dow1_1 = (new Date('' + d.getFullYear() + '/1/1')).getDay();
			var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
			if (idow == 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4) {
				idow = 1;
			}
			else if (idow === 0) {
				idow = this.V(new Date('' + (d.getFullYear() - 1) + '/12/31'), l, 'V-', 0);
			}
			return ff(idow, fixformat(f, '0'), w || 2);
		},
		w:function (d,l,f,w) {return ff(d.getDay(), fixformat(f, '0'), w || 1)},
		W:function (d,l,f,w) {return ff(parseInt(((parseInt(this.j(d, l, 'j-', 0), 10)) + (7 - this.u(d, l, 'u-', 0))) / 7, 10), fixformat(f, '0'), w || 2)},
		x:function (d,l,f,w) {return ff(d.toLocaleDateString(l, {year:'2-digit', month:'2-digit', day:'2-digit'}), f)},
		X:function (d,l,f,w) {return ff(d.toLocaleTimeString(l, {hour:'2-digit', minute:'2-digit', second:'2-digit'}), f)},
		y:function (d,l,f,w) {return ff(d.getFullYear() % 100, fixformat(f, '0'), w || 2)},
		Y:function (d,l,f,w) {return ff(d.getFullYear(), fixformat(f, '0'), w || 4)},
		z:function (d,l,f,w) {
			var t = d.getTimezoneOffset();
			var sign = t < 0 ? '+' : '-';
			t = Math.abs(t);
			return sign + ('00' + Math.floor(t / 60)).substr(-2) + ('00' + (t % 60)).substr(-2);
		},
		Z:function (d,l,f,w) {
			var result = Intl.DateTimeFormat(l, {year:'numeric', timeZoneName:'long'}).format(d);
			result = result.split(/,\s*/);
			if (result.length == 1) return ff(result[0], f);

			result = result[1].split(/\s+/).map(unit => unit.charAt(0)).join('');

			return ff(result, f);
		}
	}
	function fixformat (format, def) {
		var f = format.substring(1).replace(/[^_\-0^#]/g, '');
		return f == '' ? format.charAt(0) + def : format;
	}
	function ff (s, format, width) {
		var key = format.charAt(0);
		s = '' + s;
		format = format.substring(1);
		if (isNumber(width) && width > 1 && /^\d+$/.test(s) && format in nummap) {
			s = nummap[format](s, width, key);
		}
		else if (format in strmap) {
			s = strmap[format](s, format, key);
		}
		return s;
	}
	function strftime () {
		var format = arguments[0];
		var datetime = arguments[1] || new Date;
		var locale;
		if (!isString(format)) return false;
		if (!(datetime instanceof Date)) return false;
		return format
			.replace(/%\{locale:([^}]+)\}/g, function ($0, alocale) {
				if (locale == undefined) {
					locale = alocale;
				}
				else if (isArray(locale)) {
					locale.push(alocale);
				}
				else {
					locale = [locale];
					locale.push(alocale);
				}
				return '';
			})
			.replace(/%([_\-0^#]?)(\d*)(.)/g, function ($0, f, w, key) {
				try {
					return key in translators ?
						translators[key](datetime, locale, key + f, parseInt(w, 10) || 0) :
						key;
				}
				catch (e) {
					return $0;
				}
			});
	}
	return strftime;
})();
g.minmax = function (min, value, max) {
	return Math.max(min, Math.min(value, max));
};
g.getLiteralRegexp = function (s) {
	return s.replace(/[.+*?(){}]/g, '\\$&');
};

})(typeof global == 'object' ? global : window);

// vim:set ts=4 sw=4 fenc=UTF-8 ff=unix ft=javascript fdm=marker :
