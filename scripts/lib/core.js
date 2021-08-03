function ajax(options) {
    var req = new XMLHttpRequest();
    if (!options.method) {
        var params = [];
        for (var i in options.data) {
            params.push(encodeURIComponent(i) + '=' + encodeURIComponent(options.data[i]))
        }
        if (params.length) {
            options.url += '?' + params.join('&');
        }
    }

    req.open(options.method||'GET', options.url, true);

    if (options.headers) {
    	for (var h in options.headers) {
    		req.setRequestHeader(h, options.headers[h]);		
    	}
    }

    req.onload = function() {
        if (req.status >= 200 && req.status < 400) {
            try {
                var data = JSON.parse(req.responseText);
            } catch (e) {
                data = req.responseText;
            }
            if (options.success) {
                return options.success(data);
            }
        } else {
            console.log(req);
            if (options.fail) {
                return options.fail(data);
            }
        }
    };

    req.onerror = function(e) {
        console.log(e);
    };

    if (options.rawData) {
        return req.send(options.rawData);
    } else if (options.method && options.method.toLowerCase() == 'post') {
        req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        var params = [];
        for (var i in options.data) {
            params.push(encodeURIComponent(i) + '=' + encodeURIComponent(options.data[i]))
        }
        return req.send(params.join('&'));
    }
    return req.send();
}

function content(id) {
    document.querySelectorAll('.container').forEach(function (c) {
        c.classList.add('hidden');
    });

    document.getElementById(id).classList.remove('hidden');
    return document.getElementById(id);
}

function readForm(form) {
    var data = {};
    form.querySelectorAll('input, textarea').forEach(function (input) {
        if (input.type == 'checkbox') {
            data[input.name] = input.checked ? true : false;
        } else if (input.type == 'radio') {
            if (input.checked) {
                data[input.name] = input.value;
            }
        } else if (input.hasAttribute('date')) {
            data[input.name] = input.getAttribute('date')
        } else {
            data[input.name] = input.value;
        }
    });
    form.querySelectorAll('select').forEach(function (input) {
        data[input.name] = input.options[input.selectedIndex].value;
    });

    return data;
}