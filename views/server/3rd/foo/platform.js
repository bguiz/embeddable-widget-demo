'use strict';
/*globals document, console, XMLHttpRequest*/

console.log('hello from server');

(function(global) {
    var serverHost = '<%= serverHost %>';
    var partyId = '<%= partyId %>';
    var useIframe = <%= useIframe %>;

    init();
    injectStyles();

    function init() {
        var fooWidgets = document.querySelectorAll('.foo-widget');
        for (var i = 0; i < fooWidgets.length; ++i) {
            var fooWidget = fooWidgets[i];
            processFooWidget(fooWidget);
        }
    }

    function processFooWidget(fooWidget) {
        var id = fooWidget.getAttribute('data-foo-id');
        var processed = fooWidget.getAttribute('data-foo-processed');
        if (!id || processed === 'done') {
            //skip this one as it has either already been processed, or lacks an ID
            //This is done to ensure logic is not executed twice in the event that the
            //user erroneously embeds the script tag more than once on a single page
            console.log('skipping element:', fooWidget);
            return;
        }
        createFooWidget(fooWidget, id);
    }

    function createFooWidget(fooWidget, id) {
        <% if (useIframe) { %>
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', serverHost+'/api/3rd/foo/widget/'+id+'/init?iframe=true&partyId='+partyId);
            iframe.setAttribute('class', 'foo-widget-iframe');
            iframe.setAttribute('data-foo-id', id);
            iframe.setAttribute('width', '200px');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('scrolling', 'no');
            iframe.style.border = 'none';
            iframe.style.height = '200px';
            iframe.style.width = '200px';
            iframe.style.position = 'relative';
            iframe.style.overflow = 'hidden';
            fooWidget.appendChild(iframe);
            fooWidget.setAttribute('data-foo-processed', 'done');
        <% } else { %>
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                fooWidget.innerHTML = this.responseText;
                fooWidget.setAttribute('data-foo-processed', 'done');

                var fooWidgetButton = fooWidget.querySelector('.bar-button');
                if (!fooWidgetButton) {
                    return;
                }
                var fooWidgetButtonFunction = function() {
                    //TODO disable the button temporarily to prevent accidental double-click
                    var barXhr = new XMLHttpRequest();
                    barXhr.onload = function() {
                        var result = JSON.parse(this.responseText);
                        console.log(result);
                        var barPara = fooWidget.querySelector('.bar');
                        if (barPara) {
                            barPara.innerHTML = JSON.stringify(result);
                        }
                    };
                    barXhr.open('POST', serverHost+'/api/3rd/foo/widget/'+id+'/bar?partyId='+partyId);
                    var content = {
                        fooId: id,
                    };
                    content = JSON.stringify(content);
                    barXhr.setRequestHeader('Content-type', 'application/json');
                    barXhr.send(content);
                };
                if (fooWidgetButton.addEventListener) {
                    fooWidgetButton.addEventListener('click', fooWidgetButtonFunction);
                }
                else if (fooWidgetButton.attachEvent) {
                    fooWidgetButton.attachEvent('onclick', fooWidgetButtonFunction);
                }
                else {
                    fooWidgetButton.onclick = fooWidgetButtonFunction;
                }
            };
            xhr.open("GET", serverHost+'/api/3rd/foo/widget/'+id+'/init?partyId='+partyId);
            xhr.send();
        <% } %>
    }

    //See http://css-tricks.com/snippets/javascript/inject-new-css-rules
    function injectStyles() {
        var css = '<%= inlineCss %>';
        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        }
        else {
            style.appendChild(document.createTextNode(css));
        }
        var head = document.head || document.querySelector('head');
        head.appendChild(style);
    }
}());
