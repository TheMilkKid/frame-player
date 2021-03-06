/*
   frameplayer.js
   A video player without video files, just JSON. Based on "images frames" thought to mobile devices!

   @category
   @author Vagner Santana
   @link http://github.com/vagnervjs/frame-video
   @version:0.1
   @since: 04/10/2013
 */

var FramePlayer = function(el, options){
    this.divCont = document.getElementById(el);
    this.elem = el;
    this.jsonVideoSrc = this.divCont.getAttribute('data-vidsrc');
    this.rate = 20,
    this.controls = true,
    this.paused = false,
    this.width = '480px',
    this.height = '320px';
    this.radius = null;

    // Options
    if ('rate' in options){ this.rate = options.rate; }
    if ('controls' in options){ this.controls = options.controls;}
    if ('autoplay' in options){ if (!options.autoplay) { this.paused = true; } }
    if ('width' in options){ this.width = options.width; }
    if ('height' in options){ this.height = options.height; }
    if ('radius' in options){
        var currentStyle = document.createElement('style');
            currentStyle.setAttribute('id', 'style-' + this.elem);
            currentStyle.innerHTML = '#' + this.elem + ', .frames-' + this.elem + '{ border-radius: ' + options.radius + '; overflow: hidden;}';
            document.head.appendChild(currentStyle);
    }

    this.divCont.style.width = this.width;
    this.divCont.style.height = this.height;

    if(this.controls){ this.createControlsBar(); }
};

FramePlayer.prototype.createControlsBar = function() {
    var player = this,
    controlsBar = document.createElement('div');
    controlsBar.setAttribute('class', 'fp-ctrl');
    controlsBar.style.width = this.width;

    // Buttons
    var btnPause = document.createElement('button');
    btnPause.setAttribute('id', 'pause-' + player.elem);
    btnPause.setAttribute('class', 'fp-btn');
    btnPause.innerHTML = 'Pause';
    btnPause.addEventListener('click', function(){
            player.pause();
        }, false
    );
    controlsBar.appendChild(btnPause);

    var btnPlay = document.createElement('button');
    btnPlay.setAttribute('id', 'play-' + player.elem);
    btnPlay.setAttribute('class', 'fp-btn');
    btnPlay.innerHTML = 'Play';
    btnPlay.addEventListener('click', function(){
            player.resume();
        }, false
    );
    controlsBar.appendChild(btnPlay);

    var selectFilter = document.createElement('select'),
        option1 = document.createElement('option'),
        option2 = document.createElement('option'),
        option3 = document.createElement('option'),
        option4 = document.createElement('option');

    selectFilter.setAttribute('id', 'filter-' + player.elem);
    selectFilter.setAttribute('class', 'fp-select');
    option1.setAttribute('value', 'normal');
    option2.setAttribute('value', 'grayscale');
    option3.setAttribute('value', 'sepia');
    option4.setAttribute('value', 'invert');
    option1.innerHTML = 'Normal';
    option2.innerHTML = 'Grayscale';
    option3.innerHTML = 'Sepia';
    option4.innerHTML = 'Invert';
    selectFilter.appendChild(option1);
    selectFilter.appendChild(option2);
    selectFilter.appendChild(option3);
    selectFilter.appendChild(option4);
    selectFilter.addEventListener('change', function(){
            player.setFilter(this.value);
        }, false
    );
    controlsBar.appendChild(selectFilter);

    player.paused ? btnPause.style.display = 'none' : btnPlay.style.display = 'none';
    this.divCont.appendChild(controlsBar);
};

FramePlayer.prototype.play = function() {
    this.getFile(this.jsonVideoSrc, function(jsonVideoFile, player){
        var img = document.createElement('img'),
            i = -1,
            container = document.createElement('div');

        img.style.width = player.width;
        img.style.height = player.height;
        container.setAttribute('class', 'fp-container');
        container.style.width = player.width;
        container.style.height = player.height;
        container.appendChild(img);
        player.divCont.appendChild(container);

        setInterval(function() {
            if(!player.paused){
                i++;
                if (i >= jsonVideoFile.frames.length) {
                    i = 0;
                }
                img.src = jsonVideoFile.frames[i];
            }
        }, Math.round(1000 / player.rate));
    });
};

FramePlayer.prototype.resume = function() {
    var btnPlay = document.getElementById('play-' + this.elem),
        btnPause = document.getElementById('pause-' + this.elem);

    btnPlay.style.display = 'none';
    btnPause.style.display = 'block';
    this.paused = false;
};

FramePlayer.prototype.pause = function() {
    var btnPlay = document.getElementById('play-' + this.elem),
        btnPause = document.getElementById('pause-' + this.elem);

    btnPlay.style.display = 'block';
    btnPause.style.display = 'none';
    this.paused = true;
};

FramePlayer.prototype.setFilter = function(filter) {
    var images = document.querySelector('#' + this.elem + ' > .fp-container > img');

    switch (filter) {
      case 'normal':
        images.setAttribute('class', '');
        break;
      case 'grayscale':
        images.setAttribute('class', 'fp-grayscale');
        break;
      case 'sepia':
        images.setAttribute('class', 'fp-sepia');
        break;
      case 'invert':
        images.setAttribute('class', 'fp-invert');
        break;
      default:
        break;
    }
};

FramePlayer.prototype.getFile = function(src, callback){
    var _HTTP = new XMLHttpRequest(),
        player = this,
        p = document.createElement('p');

    if (_HTTP) {
        _HTTP.open('GET', src, true);
        _HTTP.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        _HTTP.send(null);

        _HTTP.onprogress = function() {
            p.innerHTML = 'Loading...';
            p.setAttribute('class', 'fp-loading');
            player.divCont.appendChild(p);
        };

        if (typeof(_HTTP.onload) !== undefined){
            _HTTP.onload = function() {
                player.divCont.removeChild(p);
                callback(JSON.parse(this.responseText), player);
                _HTTP = null;
            };
        } else {
            _HTTP.onreadystatechange = function() {
                if (_HTTP.readyState === 4) {
                    player.divCont.removeChild(p);
                    callback(JSON.parse(this.responseText), player);
                    _HTTP = null;
                }
            };
        }
    } else {
        console.log('Error loading file.');
    }
};
