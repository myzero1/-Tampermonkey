// ==UserScript==
// @name         Tampermonkey chrome sqlite
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://top.taobao.com/*
// @match        https://search1.taobao.com/*
// @match        https://www.baidu.com/?to_top=1
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
    //- business function

    delete_cookie('t', '/','.taobao.com');

    //GM_setValue('recordedDate','');

    go_top();

    /*
    https://www.baidu.com/?to_top=1
    https://top.taobao.com/index.php?topId=TR_FS&leafId=50012027&rank=search&type=hot&s=0
    https://search1.taobao.com/itemlist/default.htm?cat=0&sd=1&viewIndex=1&as=0&spm=a2106.ad1.1000572.d2&commend=all&atype=b&style=list&q=%E5%A5%B3%E9%9E%8Bqu&same_info=1&tid=0&isnew=2&_input_charset=utf-8
    */

    //--go_top
    function go_top(){
        console.log('go_top');
        var index_url = 'https://www.baidu.com/?to_top=1';
        if (window.location.href==index_url) {
            var sHtmlA = '<a id="go_top" target="_self" href="https://top.taobao.com/index.php?topId=TR_FS&leafId=50012027&rank=search&type=hot&s=0">to top</a>';
            $("#lg").before(sHtmlA);
            $('#go_top')[0].click();
        } else {
            main();
        }
    }

    //-- main

    function main() {
        console.log('----main-----');
        databaseInit();
        urlManagerInit();
        urlManagerGetUrl();

    }

    //-- urlManager
    function urlManagerInit(){
        var myDate = new Date();
        var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
        var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        var date = myDate.getDate();        //获取当前日(1-31)
        // add url
        var baseUrls = new Array('https://top.taobao.com/index.php?leafId=50012027&rank=search&type=hot&s=');
        var dateTmp = year + '-' + month + '-' + date;
        var urlValues = new Array();
        var timestamp=new Date().getTime();
        for (var i = baseUrls.length - 1; i >= 0; i--) {
            for (var j = 0; j < 5; j++) {
                var url = baseUrls[i] + 20*j;
                timestamp = timestamp + i + j + 1;
                urlValues.push('('+timestamp+', "'+url+'", "'+dateTmp+'", 0)');
            }
        }

        //var sql = 'INSERT OR IGNORE INTO url_manager (id,url,updated) VALUES ((select last_insert_rowid() from url_manager), "'+url+'", "'+dateTmp+'")';
        var sValues = urlValues.join(',');
        var sql = 'INSERT OR IGNORE INTO url_manager (id,url,updated,status) VALUES ' + sValues;
        execute(sql);
    }

    function urlManagerGetUrl(){
        var myDate = new Date();
        var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
        var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        var date = myDate.getDate();        //获取当前日(1-31)
        var dateTmp = year + '-' + month + '-' + date;
        var sql = 'SELECT * FROM url_manager WHERE status=0 AND updated="'+dateTmp+'" LIMIT 1;';
        //console.log(sql);
        //var myresult = query(sql);
        //db query Promise对象，
        window.db.transaction(function (tx){
            tx.executeSql(sql,[],function(tx,result){
                console.log(result.rows.length);
                if (result.rows.length==1) {

                    if (window.location.href.indexOf('top.taobao.com') >= 0) {
                        // updateAmount();
                        //alert(33333);

                        if (urlIsEqual(result.rows[0].url,window.location.href)) {
                            //parse(result.rows[0].url);
                            parseTop(result.rows[0].url);
                        } else {
                            window.location.href = result.rows[0].url;
                        }
                    }

                } else {
                    //alert('top page finished');
                    getAmount();
                }
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });

    }

    //-- parse
    function parse(url){
        console.log('----parse-----');
        console.log(url);
        if (url.indexOf('top.taobao.com') >= 0) {
            parseTop(url);
        }
    }

    //--getAmount
    function getAmount(){

        var sql = 'SELECT * FROM key_data WHERE amount=0 AND updated="'+getDateString() + '"';
        //console.log(sql);
        //var myresult = query(sql);
        //db query Promise对象，
        window.db.transaction(function (tx){
            tx.executeSql(sql,[],function(tx,result){
                var resultRows = result.rows;
                if (resultRows.length>0) {
                    for (var i = resultRows.length - 1; i >= 0; i--) {
                        var sKey = resultRows[i].pkey;
                        var sKeyNew = getNewKey(sKey);
                        //console.log(sKey);
                        //console.log(sKeyNew);
                        getSuggestions(sKeyNew,resultRows[i],updateDBKeyData,sKey);
                    }

                    //alert('get amount finished');
                    waiteToFinish(15000);
                } else {
                    //alert('get amount finished');
                    waiteToFinish(0);
                }
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
    }

    function waiteToFinish(microsecond){
        var t=setTimeout(function(){
            var sql = 'UPDATE key_data SET amount=1 WHERE amount=0 AND updated="'+getDateString()+'";';
            console.log(sql);
            window.db.transaction(function(tx){
                tx.executeSql(sql,[],function(tx,rs){
                    //alert('yes');
                    //return true;
                },
                function (tx,err){
                    //alert('no');
                    console.log(err.source +'===='+err.message);
                });
            });

            setTimeout(function(){
                window.location.href = 'https://www.baidu.com/?to_top=0';
            },3000);
        },microsecond);
    }


    function updateDBKeyData(row,response,sKey){
        var sNullRes = 'KISSY.Suggest.callback({"result":[]})';
        if(response.status==200 && response.responseText != sNullRes){
            var sResponse = response.responseText;
            var sResponseJson = sResponse.replace(/KISSY.Suggest.callback/,'');
            var oResponseJson = eval(sResponseJson);
            // console.log(oResponseJson);

            var dateTmp = getDateString();
            var keyValues = new Array();
            var timestamp=new Date().getTime();
            var result = oResponseJson.result;
            for (var i = result.length - 1; i >= 0; i--) {
                timestamp = timestamp + i + 1;

                if (result[i][0] == sKey ) {
                    keyValues.push('('+row.id+', "'+row.pkey+'", '+row.focus+','+row.lift+','+result[i][1]+',"'+dateTmp+'")');
                } else if (result[i][0].indexOf('鞋')>=0) {
                    keyValues.push('('+timestamp+', "'+result[i][0]+'", 100, 0,'+result[i][1]+',"'+dateTmp+'")');
                }
            }

            if (keyValues.length > 0) {
                var sValues = keyValues.join(",");
                var sql = 'INSERT OR REPLACE INTO key_data (id,pkey,focus,lift,amount,updated) VALUES ' + sValues;
                //console.log(sql);

                window.db.transaction(function(tx){
                    tx.executeSql(sql,[],function(tx,rs){
                        // ok
                    },
                    function (tx,err){
                        console.log(err.source +'===='+err.message);
                    });
                });
            }
        }

    }

    function getNewKey(sKey){
        return sKey.substring(0,sKey.length-1);
    }

    function getSuggestions(sKeyNew,row,updateDBKeyData,sKey){
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://suggest.taobao.com/sug?extras=1&code=utf-8&callback=KISSY.Suggest.callback&q="+sKeyNew,
            headers: {
                "User-Agent": "Mozilla/5.0",    // If not specified, navigator.userAgent will be used.
                "Accept": "text/xml"            // If not specified, browser defaults will be used.
            },
            onload: function(response) {
                if(response.status==200){
                    var sResponse = response.responseText;
                    var sResponseJson = sResponse.replace(/KISSY.Suggest.callback/,'');
                    var oResponseJson = eval(sResponseJson);
                    updateDBKeyData(row,response,sKey);
                }
            }
        });
    }

    //-- parseTop
    function parseTop(url){
        console.log('----parseTop-----');
        var rows = new Array();
        var rows2 = new Array();
        var i = 0;
        $('.J_contentRow .row').each(function(){
            i++;
            var dateTmp = getDateString();
            var timestamp=new Date().getTime() + i;

            var title = $(this).find('.col2 .title').text();
            var focus_bar = $(this).find('.col4 .focus-bar').text();
            var up_down = $(this).find('.col5').text();
            var up_down_icon_tmp = $(this).find('.col5 .icon-btn-bang-1-trend.icon').length;
            var up_down_icon = up_down_icon_tmp==1 ? '+' : '-';
            var up_down_percent = $(this).find('.col6').text();
            var up_down_percent_icon_tmp = $(this).find('.col6 .icon-btn-bang-1-trend icon').length;
            var up_down_percent_icon = up_down_percent_icon_tmp==1 ? '+' : '-';

            var row = '("'+timestamp+'","'+trim(title)+'","'+trim(focus_bar)+'","'+trim(up_down_icon)+trim(up_down)+'","'+dateTmp+'")';
            rows.push(row);
        });

        var sValues = rows.join(",");
        var sql = 'INSERT OR IGNORE INTO key_data (id,pkey,focus,lift,updated) VALUES ' + sValues;
        console.log(sql);

        window.db.transaction(function(tx){

            tx.executeSql(sql,[],function(tx,rs){
                var sql3 = 'UPDATE url_manager SET status=1 WHERE status=0 AND updated="'+getDateString()+'" AND url="'+url+'"';
                window.db.transaction(function(tx){
                    tx.executeSql(sql3,[],function(tx,rs){
                        location.reload();
                    },
                    function (tx,err){
                        console.log(err.source +'===='+err.message);
                    });
                });
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
    }

    //-- database init
    function databaseInit() {
        createConnection('tb1002');
        var sql = 'CREATE TABLE IF NOT EXISTS url_manager (id INT PRIMARY KEY, url TEXT, updated DATE, status INT, UNIQUE (url, updated));';
        execute(sql);
        var sql = 'CREATE TABLE IF NOT EXISTS key_data (id INT PRIMARY KEY,pkey TEXT,focus DOUBLE,lift DOUBLE,amount DOUBLE DEFAULT 0,updated DATE, UNIQUE (pkey, updated));';
        execute(sql);
    }

    //- unit function
    function trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    function getUrlParam (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        //console.log(window.location.search);return false;
        if (r != null) return unescape(r[2]); return null;
    }

    function parseUrlParam (url,name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = url.substr(1).match(reg);

        if (r != null) {
            var result = unescape(r[2]) == 0 ? null : unescape(r[2]);
        } else {
            var result = null;
        }

        return result;
    }

    function getDateString(){
        var myDate = new Date();
        var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
        var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        var date = myDate.getDate();        //获取当前日(1-31)
        var dateTmp = year + '-' + month + '-' + date;
        return dateTmp;
    }


    function urlIsEqual(url1,url2){
        console.log(url1);
        console.log(url2);
        url1Rank = parseUrlParam(url1,'rank');
        url1Type = parseUrlParam(url1,'type');
        url1S = parseUrlParam(url1,'s');
        url1Q = parseUrlParam(url1,'q');
        url2Rank = parseUrlParam(url2,'rank');
        url2Type = parseUrlParam(url2,'type');
        url2S = parseUrlParam(url2,'s');
        url2Q = parseUrlParam(url2,'q');


        if (url2Q!=null) {
            console.log(url1);
            console.log(url2);
            console.log(url1Q);
            console.log(url2Q);
            return false;
        }

        if (url1Q==url2Q && url2Q!=null) {
            return true;
        } else if (url1Rank==url2Rank && url1Type==url2Type && url1S==url2S) {
           return true;
        } else {
           return false;
        }
    }

    function createConnection(dbName){
        window.db = openDatabase(dbName,'1.0','This is a datatable for tb100',1024*100);//数据库名 版本 数据库描述 大小
    }

    function execute(sql){
        window.db.transaction(function(tx){
            tx.executeSql(sql,[],function(tx,rs){
                // alert('yes');
                //return true;
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
    }

    function delete_cookie( name, path, domain  ) {
      document.cookie = name + "=" +
      ((path) ? ";path="+path:"")+
      ((domain)?";domain="+domain:"") +
      ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }

});
