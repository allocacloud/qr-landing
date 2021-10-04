var App = function (tree) {
    var self = this;

    this.container = document.getElementById('tree');
    this.tree = JSON.parse(tree);
    this.back = document.querySelector('.back');
    this.title = document.querySelector('.title span');
    this.overlay = document.querySelector('.overlay');
    this.TIMER = 60;
    this.resend = document.querySelector('button.resend');

    this.icons = {
        folder: '<svg width="35" height="35" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path class="line" d="M34.593 16.235c-.532-.858-1.472-1.37-2.515-1.37h-2.603v-4.776c0-1.153-.973-2.09-2.168-2.09H14.562a.07.07 0 01-.036-.01L12.245 4.8a2.191 2.191 0 00-1.785-.903H2.168C.972 3.896 0 4.834 0 5.986v22.911c0 1.18.996 2.14 2.22 2.14h25.797c.402 0 .749-.232.917-.569l5.781-11.61a2.682 2.682 0 00-.123-2.623zM2.168 5.947h8.292c.061 0 .103.027.116.046l2.285 3.194a2.09 2.09 0 001.7.862h12.746c.072 0 .108.034.117.046v4.77H8.866c-1.15 0-2.197.648-2.667 1.652l-4.148 8.878V5.993c.009-.012.045-.046.117-.046zM32.88 17.944l-5.498 11.042H2.636l5.421-11.6c.132-.282.457-.47.81-.47h23.211c.328 0 .616.148.77.398.088.141.164.365.032.63z"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h35v35H0z"/></clipPath></defs></svg>',
        check: '<svg width="35" height="35" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.508 33.003A15.552 15.552 0 013.573 24.31C.938 18.926 1.736 12.214 5.559 7.606 9.378 3.003 15.586.994 21.374 2.49a1.193 1.193 0 01-.596 2.31c-4.896-1.265-10.151.434-13.383 4.33-3.234 3.9-3.91 9.578-1.68 14.132 2.22 4.536 7.12 7.49 12.148 7.354 5.028-.137 9.591-3.195 11.625-7.79a13.194 13.194 0 00.71-8.605 1.193 1.193 0 012.31-.596c.87 3.368.572 6.978-.839 10.166-2.404 5.431-7.797 9.046-13.74 9.208-.14.003-.281.005-.42.005z" class="line"/><path d="M17.499 21.22a1.192 1.192 0 01-.843-2.035l14.309-14.31a1.192 1.192 0 111.686 1.687L18.34 20.87a1.19 1.19 0 01-.842.35z" class="line"/><path d="M17.498 21.22c-.305 0-.61-.116-.843-.35l-5.058-5.058a1.192 1.192 0 011.686-1.686l5.059 5.059a1.192 1.192 0 01-.843 2.035z" class="line"/></svg>'
    }

    this.init = function () {
        this.render();

        self.back.addEventListener('click', function (e) {
            e.preventDefault();

            var value = parseInt(this.getAttribute('data-id'))
            if (value || this.getAttribute('data-id') == "null") {
                self.render(this.getAttribute('data-id') == "null" ? null : this.getAttribute('data-id'));
            } else {
                self[this.getAttribute('data-id')].call()
            }
        });

        self.overlay.querySelector('.close').addEventListener('click', function () {
            self.overlay.classList.add('hidden');
        });

        document.querySelector('.confirmation').addEventListener('click', function (e) {
            e.preventDefault();

            self.overlay.classList.remove('hidden');
        });

        document.querySelector('form').addEventListener('submit', function (e) {
            return self.submit(e);
        });

        document.querySelector('button.send-confirm').addEventListener('click', function (e) {
            e.preventDefault();

            var data = readForm(document.querySelector('form'));

            if (data.phone && !/^\+38\d{10}$/.test(data.phone)) {
                e.preventDefault();
                document.querySelector('input[name="phone"]').setCustomValidity(app.wrong_email);
                document.querySelector('input[name="phone"]').reportValidity();
                return false;
            } else {
                document.querySelector('input[name="phone"]').setCustomValidity("")
            }

            if (data.email && !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(data.email)) {
                e.preventDefault();
                document.querySelector('input[name="email"]').setCustomValidity(app.wrong_email);
                document.querySelector('input[name="email"]').reportValidity();
                return false;
            } else {
                document.querySelector('input[name="email"]').setCustomValidity("")
            }

            self.confirmation(data.email ? {type: 'email', value: data.email} : {type: 'phone', value: data.phone});
        });

        document.querySelector('button.confirm').addEventListener('click', function (e) {
            e.preventDefault();

            ajax({
                url: '/confirmation',
                method: 'POST',
                data: Object.assign(self.data, {code: document.querySelector('input[name="code"]').value}),
                success: function (data) {
                    if (data.success == true) {
                        document.querySelector('form').submit();
                    } else {
                        document.querySelector('input[name="code"]').setCustomValidity(app.wrong_code);
                        document.querySelector('input[name="code"]').reportValidity();
                    }
                }
            })
        })

        document.querySelector('button.resend').addEventListener('click', function (e) {
            e.preventDefault();

            self.sendConfirmation();
        })

        self.uploader = new Uploader(document.querySelector('.uploader'));
    }

    this.render = function (parent_id = null) {
        var ul = document.createElement('ul');
        ul.classList = 'tree';

        var sel;
        self.tree.forEach(function (row) {
            if (row.service_id == parent_id) {
                sel = row;
            }
        });

        if (sel) {
            self.title.innerHTML = sel.service_name;
            self.back.classList.remove('hidden');
            self.back.setAttribute('data-id', sel.service_parent_id);
        } else {
            self.title.innerHTML = self.title.getAttribute('data-default');
            self.back.classList.add('hidden');
            self.back.setAttribute('data-id', null);
        }

        self.tree.forEach(function (row) {
            if (row.service_parent_id == parent_id) {
                var li = document.createElement('li');
                var a = document.createElement('a');

                var hasChildren = false;
                self.tree.forEach(function (child) {
                    if (child.service_parent_id == row.service_id) {
                        hasChildren = true;
                    }
                });

                var icon = hasChildren ? self.icons.folder : self.icons.check;

                a.innerHTML = icon + row.service_name;
                if (hasChildren) {
                    a.setAttribute('data-children', true);
                }
                a.setAttribute('data-id', row.service_id);
                a.setAttribute('href', '#');

                li.appendChild(a);
                ul.appendChild(li);

                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (this.getAttribute('data-children')) {
                        return self.render(this.getAttribute('data-id'));
                    }
                    self.id = this.getAttribute('data-id');
                    return self.create();
                })
            }
        });
        
        self.container.innerHTML = '';
        self.container.appendChild(ul);
        content('tree');
    }

    this.create = function () {
        var sel;
        self.tree.forEach(function (row) {
            if (row.service_id == self.id) {
                sel = row;
            }
        });

        if (sel) {
            self.back.setAttribute('data-id', sel.service_parent_id);
        }

        var container = content('create');

        document.getElementById('title').innerText = sel.service_name;
        self.title.innerText = container.dataset.title;
        container.querySelector('input[name="id"]').value = this.id;

        document.querySelectorAll('.reg input').forEach(function (input) {
            input.removeAttribute('required');
        });

        if (!self.regInit) {
            container.querySelector('.button.reg').addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (document.querySelector('textarea').checkValidity()) {
                    self.reg();
                } else {
                    document.querySelector('textarea').reportValidity();
                }
            });

            self.regInit = true;
        }
    }

    this.reg = function () {
        var container = content('reg');
        document.querySelector('.title span').innerText = container.dataset.title;

        self.back.setAttribute('data-id', "create");

        container.querySelectorAll('input[name="name"]').forEach(function (input) {
            input.setAttribute('required', 'required');
        });
    }

    this.confirmation = function (data) {
        var container = content('confirm');
        document.querySelector('.title span').innerText = container.dataset.title.replace('%type%', app[data.type + '1']);

        self.timerContainer = document.getElementById('countdown');
        self.seconds = self.TIMER;
        
        var p = container.querySelector('p[data-orig]');
        p.innerHTML = p.dataset.orig.replace('%placeholder%', data.value).replace('%type%', app[data.type + '2']);

        self.sendConfirmation(data);
    }

    this.sendConfirmation = function (data) {
        if (data) {
            self.data = data
        };

        document.querySelector('input[name="code"]').value = '';
        document.querySelector('input[name="code"]').focus();

        self.resend.disabled = true;

        self.timer = setInterval(function () {
            self.seconds--;
            self.timerContainer.innerText = self.seconds;
            if (self.seconds == 0) {
                clearTimeout(self.timer);
                self.seconds = self.TIMER;
                self.resend.disabled = false;
            }
        }, 1000);

        ajax({
            url: '/confirmation',
            method: 'POST',
            data: self.data
        });
    }

    this.submit = function (e) {
        var data = readForm(document.querySelector('form'));

        if (!document.querySelector('input[name="name"]').getAttribute('required')) {
            if (!data.description) {
                e.preventDefault();
                document.querySelector('textarea').reportValidity();
                return false;
            }
        }

        return true;
    }

    this.init();

    return this;
}