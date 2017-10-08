// ==UserScript==
// @name         New Userscript
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
// @require    http://libs.baidu.com/jquery/1.9.0/jquery.min.js
// ==/UserScript==

//---------------------
$(document).ready(function(){
    //- business function

    main();

    //-- main

    function main() {
        console.log('----main-----');
        databaseInit();
        console.log(1);
        urlManagerInit();
        console.log(2);
        urlManagerGetUrl();
        console.log(3);

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
                    console.log(result.rows[0].url);
                    console.log(window.location.href);
                    console.log(urlIsEqual(result.rows[0].url,window.location.href));
                    if (urlIsEqual(result.rows[0].url,window.location.href)) {
                        parse(result.rows[0].url);
                    } else {
                        window.location.href = result.rows[0].url;
                    }
                } else {
                    alert('finished');
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
        } else if(url.indexOf('search1.taobao.com') >= 0){
            parseNum(url);
        }
    }

    //--parseNum(url);
    function parseNum(url){
        console.log('----parseNum-----');
        var total = trim($(".total .num").text());

        var sql2 = 'UPDATE key_data SET amount='+total+' WHERE updated="'+getDateString()+'" AND pkey="'+parseUrlParam (url,'q')+'"';
        window.db.transaction(function(tx){
            tx.executeSql(sql3,[],function(tx,rs){
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
            var up_down_icon_tmp = $(this).find('.col5 .icon-btn-bang-1-trend icon').length;
            var up_down_icon = up_down_icon_tmp==1 ? '+' : '-';
            var up_down_percent = $(this).find('.col6').text();
            var up_down_percent_icon_tmp = $(this).find('.col6 .icon-btn-bang-1-trend icon').length;
            var up_down_percent_icon = up_down_percent_icon_tmp==1 ? '+' : '-';

            var row = '("'+timestamp+'","'+trim(title)+'","'+trim(focus_bar)+'","'+trim(up_down_icon)+trim(up_down)+'","'+dateTmp+'")';
            rows.push(row);


            var urlTmp = 'https://search1.taobao.com/itemlist/nvxieshichang2011a.htm?cat=50006843&viewIndex=1&as=0&commend=all&atype=b&style=grid&q='+encodeURI(trim(title))+'&same_info=1&isnew=2&tid=0&_input_charset=utf-8';
            var row2 = '("'+timestamp+'","'+urlTmp+'","'+dateTmp+'",0)';
            rows2.push(row2);
        });

        var sValues = rows.join(",");
        var sql = 'INSERT OR IGNORE INTO key_data (id,pkey,focus,lift,updated) VALUES ' + sValues;
        console.log(sql);

        var sValues2 = rows2.join(",");
        var sql2 = 'INSERT OR IGNORE INTO url_manager (id,url,updated,status) VALUES ' + sValues2;
        console.log(sql2);

        window.db.transaction(function(tx){
            tx.executeSql(sql2,[],function(tx,rs){
                //ok
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });

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
        var sql = 'CREATE TABLE IF NOT EXISTS key_data (id INT PRIMARY KEY,pkey TEXT UNIQUE,focus DOUBLE,lift DOUBLE,amount DOUBLE,updated DATE, UNIQUE (pkey, updated));';
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

    function query(sql){
        window.db.transaction(function (tx){
            tx.executeSql(sql,[],function(tx,result){
                // for(var i = 0 ;i<result.rows.length;i++){
                //     showData(result.rows.item(i));
                // }
                //console.log(result);
                //return result.rows;
                console.log(result.rows);
                return result.rows;
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
        console.log(window.queryResult);
        return window.queryResult;
    }

});
