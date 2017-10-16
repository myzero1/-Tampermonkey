// ==UserScript==
// @name         Tampermonkey get tb suggest
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://search1.taobao.com/*
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_listValues
// @grant GM_log
// @grant GM_deleteValue
// @grant GM_xmlhttpRequest
// @require    http://libs.baidu.com/jquery/1.9.0/jquery.min.js
// ==/UserScript==

//---------------------
$(document).ready(function(){
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://suggest.taobao.com/sug?extras=1&code=utf-8&callback=KISSY.Suggest.callback&q=女鞋",
        headers: {
            "User-Agent": "Mozilla/5.0",    // If not specified, navigator.userAgent will be used.
            "Accept": "text/xml"            // If not specified, browser defaults will be used.
        },
        onload: function(response) {
            console.log(response);

            if(response.status==200){
                var sResponse = response.responseText;
                var sResponseJson = sResponse.replace(/KISSY.Suggest.callback/,'');
                var oResponseJson = eval(sResponseJson);
                console.log(oResponseJson);
                console.log(oResponseJson.result[0][0]);
            }

            /*
            GM_log([
                response.status,
                response.statusText,
                response.readyState,
                response.responseHeaders,
                response.responseText,
                response.finalUrl
            ].join("\n"));
            */
        }
    });

});
