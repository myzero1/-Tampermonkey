// ==UserScript==
// @name         tb_tampermonkey_sqllit_oop
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  get taobao hot key data
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
// @require    https://img.hcharts.cn/highcharts/highcharts.js
// ==/UserScript==

//---------------------
$(document).ready(function(){
    var TB = {
        "fMain" : null,
        "_oUtils" : null,
        "_fGoTbTop" : null,
        "_pDb" : null,
        "_pKeyTmp" : null,
        "_fDatabaseInit" : null,
        "_fUrlManagerInit" : null,
        "_fParseTop" : null,
        "_fGoTbTop" : null,
        "_fHighchartData" : null,
        "_fHighcharts" : null,
        "_fFinish" : null,
        "_fGpdateDBKeyData" : null,
        "_fGetSuggestions" : null,
        "_fUpdateAmount" : null,
        "_fUrlManagerGetUrl" : null,
        "_fRun" : null,
        "_end" : null
    };

    TB._oUtils = {
        "fUtilsExtends" : function(parentObjArray,childObj) {
            console.log(parentObjArray);
            for (var i = parentObjArray.length - 1; i >= 0; i--) {
                for (var key in parentObjArray[i]) {
                    if (key in childObj) {
                        // pass
                    } else {
                        childObj[key] = parentObjArray[i][key];
                    }
                }
            }
            return childObj;
        },
        "fDeleteCookie" : function ( name, path, domain  ) {
            document.cookie = name + "=" +
              ((path) ? ";path="+path:"")+
              ((domain)?";domain="+domain:"") +
              ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
        },
        "fGetDateString" : function(){
            var myDate = new Date();
            var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
            var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
            var date = myDate.getDate();        //获取当前日(1-31)
            var dateTmp = year + '-' + month + '-' + date;
            return dateTmp;
        },
        "fTrim" : function(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        },
        "fParseUrlParam" : function(url,name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = url.substr(1).match(reg);
            if (r != null) {
                var result = unescape(r[2]) == 0 ? null : unescape(r[2]);
            } else {
                var result = null;
            }
            return result;
        },
        "fUrlIsEqual" : function(url1,url2){
            url1Rank = TB._oUtils.fParseUrlParam(url1,'rank');
            url1Type = TB._oUtils.fParseUrlParam(url1,'type');
            url1S = TB._oUtils.fParseUrlParam(url1,'s');
            url2Rank = TB._oUtils.fParseUrlParam(url2,'rank');
            url2Type = TB._oUtils.fParseUrlParam(url2,'type');
            url2S = TB._oUtils.fParseUrlParam(url2,'s');

            if (url1Rank==url2Rank && url1Type==url2Type && url1S==url2S) {
               return true;
            } else {
               return false;
            }
        },
        "fGetNewKey" : function(sKey){
            return sKey.substring(0,sKey.length-1);
        },
        "fGetDays" : function(iDays){
            var myDate = new Date(); //获取今天日期
            myDate.setDate(myDate.getDate() - iDays + 1);
            var dateArray = []; 
            var dateTemp; 
            var flag = 1; 
            for (var i = 0; i < iDays; i++) {
                dateTemp = myDate.getFullYear()+"-"+(myDate.getMonth()+1)+"-"+myDate.getDate();
                dateArray.push(dateTemp);
                myDate.setDate(myDate.getDate() + flag);
            }
            return dateArray;
        }
    };

    TB._fGoTbTop = function(){
        var index_url = 'https://www.baidu.com/?to_top=1';
        if (window.location.href==index_url) {
            var sHtmlA = '<a id="go_top" target="_self" href="https://top.taobao.com/index.php?topId=TR_FS&leafId=50012027&rank=search&type=hot&s=0">to top</a>';
            $("#lg").before(sHtmlA);
            $('#go_top')[0].click();
        } else {
            TB._fRun();
        }
    };

    TB._pDb = openDatabase('tb100','1.0','This is a datatable for tb100',1024*100);//数据库名 版本 数据库描述 大小

    TB._fDatabaseInit = function(){
        var sqlUrlManager = 'CREATE TABLE IF NOT EXISTS url_manager (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, updated DATE, status INT, UNIQUE (url, updated));';
        var sqlKeyData = 'CREATE TABLE IF NOT EXISTS key_data (id INTEGER PRIMARY KEY AUTOINCREMENT,pkey TEXT,focus DOUBLE,lift DOUBLE,amount DOUBLE DEFAULT 0,updated DATE, UNIQUE (pkey, updated));';

        TB._pDb.transaction(function(tx){
            tx.executeSql(sqlUrlManager,[],function(tx,rs){
                console.log('create url_manager is ok.');
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });

        TB._pDb.transaction(function(tx){
            tx.executeSql(sqlKeyData,[],function(tx,rs){
                console.log('create key_data is ok.');
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
    };

    TB._fUrlManagerInit = function(){
        var baseUrls = new Array('https://top.taobao.com/index.php?leafId=50012027&rank=search&type=hot&s=');
        var dateTmp = TB._oUtils.fGetDateString();
        var urlValues = new Array();
        for (var i = baseUrls.length - 1; i >= 0; i--) {
            for (var j = 0; j < 5; j++) {
                var url = baseUrls[i] + 20*j;
                urlValues.push('(NULL, "'+url+'", "'+dateTmp+'", 0)');
            }
        }

        //var sql = 'INSERT OR IGNORE INTO url_manager (id,url,updated) VALUES ((select last_insert_rowid() from url_manager), "'+url+'", "'+dateTmp+'")';
        var sValues = urlValues.join(',');
        var sql = 'INSERT OR IGNORE INTO url_manager (id,url,updated,status) VALUES ' + sValues;
        console.log(sql);
        TB._pDb.transaction(function(tx){
            tx.executeSql(sql,[],function(tx,rs){
                console.log('_urlManagerInit is ok.');
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
    };

    TB._fParseTop = function(url){
        var rows = new Array();
        $('.J_contentRow .row').each(function(){
            var dateTmp = TB._oUtils.fGetDateString();

            var title = $(this).find('.col2 .title').text();
            var focus_bar = $(this).find('.col4 .focus-bar').text();
            var up_down = $(this).find('.col5').text();
            var up_down_icon_tmp = $(this).find('.col5 .icon-btn-bang-1-trend.icon').length;
            var up_down_icon = up_down_icon_tmp==1 ? '+' : '-';
            var up_down_percent = $(this).find('.col6').text();
            var up_down_percent_icon_tmp = $(this).find('.col6 .icon-btn-bang-1-trend icon').length;
            var up_down_percent_icon = up_down_percent_icon_tmp==1 ? '+' : '-';

            var row = '(NULL,"'+
                TB._oUtils.fTrim(title)+'","'+
                TB._oUtils.fTrim(focus_bar)+'","'+
                TB._oUtils.fTrim(up_down_icon)+
                TB._oUtils.fTrim(up_down)+
                '","'+dateTmp+'")';
            rows.push(row);
        });

        var sValues = rows.join(",");
        var sql = 'INSERT OR IGNORE INTO key_data (id,pkey,focus,lift,updated) VALUES ' + sValues;

        TB._pDb.transaction(function(tx){
            tx.executeSql(sql,[],function(tx,rs){
                var sql3 = 'UPDATE url_manager SET status=1 WHERE status=0 AND updated="'+
                TB._oUtils.fGetDateString()+'" AND url="'+url+'"';
                TB._pDb.transaction(function(tx){
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
    };


    TB._fHighcharts = function(highchartData){
        sHtmlH = '<div id="highcharts" width="800" height="800"></div>';
        $('body').prepend(sHtmlH);

        // var highchartData = TB._fHighchartData();

        $('#highcharts').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: '月平均气温'
            },
            subtitle: {
                text: '数据来源: WorldClimate.com'
            },
            xAxis: {
                categories: highchartData['categories']
            },
            yAxis: {
                title: {
                    text: '气温 (°C)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true          // 开启数据标签
                    },
                    enableMouseTracking: false // 关闭鼠标跟踪，对应的提示框、点击事件会失效
                }
            },
            series: highchartData['series']
        });
    }

    TB._fHighchartData = function(){
        var highchartData = {},_oKeys,_oKeyDatas;

        var sql = 'SELECT * FROM key_data WHERE amount>1 AND updated="'+
            TB._oUtils.fGetDateString() + '"';
        TB._pDb.transaction(function (tx){
            tx.executeSql(sql,[],function(tx,result){
                var _oKeys = result.rows;
                var myFlag = 7;
                var aDays = TB._oUtils.fGetDays(myFlag);
                console.log(aDays);

                var categories = new Array();
                for (var key in _oKeys) {
                    categories.push(_oKeys[key]["updated"]);
                }
                highchartData['categories'] = categories;
                highchartData['series'] = new Array();

                for (var k in _oKeys) {
                    var sql2 = 'SELECT * FROM key_data WHERE amount>1 AND updated>="'+
                        aDays[0] + '" AND pkey="'+_oKeys[k]['pkey']+'"';
                    tx.executeSql(sql2,[],function(tx,result){
                        var rows = result.rows;
                        var serieData = new Array();

                        for (var i = 0; i < aDays.length; i++) {
                            var hasAmount = false;
                            for (var k2 in rows) {
                                if (aDays[i]==rows[k2]['updated']) {
                                    serieData.push(rows[k2]['amount']);
                                    hasAmount = true;
                                }
                            }

                            if (!hasAmount) {
                                serieData.push(0);
                            }
                            
                        }

                        if (rows.length>0) {
                            var serieItem = {
                                'name' : rows[0]['pkey'],
                                'data' : serieData
                            }
                            highchartData['series'].push(serieItem);
                        }
                    },
                    function (tx,err){
                        console.log(err.source +'===='+err.message);
                    });
                }

                console.log(highchartData);

                setTimeout(function(){
                    TB._fHighcharts(highchartData);
                },10000);

                



            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });








        // highchartData['categories'] = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        // highchartData['series'] = [{
        //         name: '东京',
        //         data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        //     }, {
        //         name: '伦敦',
        //         data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        //     }];

        // console.log(highchartData);

        // return highchartData;
    }


    TB._fFinish = function(){
        var sql = 'UPDATE key_data SET amount=1 WHERE amount=0 AND updated="'+
            TB._oUtils.fGetDateString()+'";';
        TB._pDb.transaction(function(tx){
            tx.executeSql(sql,[],function(tx,rs){
                console.log("set amount to 1");
                TB._fHighchartData();
                //window.location.href = 'https://www.baidu.com/?to_top=0';
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
    };

    TB._fGpdateDBKeyData = function(rows,response,bIsEnd){
        var sNullRes = 'KISSY.Suggest.callback({"result":[]})';

        if(response.status==200 && response.responseText != sNullRes){
            var sResponse = response.responseText;
            var sResponseJson = sResponse.replace(/KISSY.Suggest.callback/,'');
            var oResponseJson = eval(sResponseJson);

            var dateTmp = TB._oUtils.fGetDateString();
            var keyValues = new Array();
            var result = oResponseJson.result;
            for (var i in result) {
                for (var j in rows) {
                    if (rows[j]['pkey'] == result[i][0]) {
                        var row = rows[j];
                        keyValues.push('(NULL, "'+row.pkey+'", '+row.focus+','+row.lift+','+result[i][1]+',"'+dateTmp+'")');
                    } else {
                        // if (result[i][0].indexOf('鞋')>=0 && result[i][0].indexOf('女')>=0 ) {
                        //     keyValues.push('(NULL, "'+result[i][0]+'", 100, 0,'+result[i][1]+',"'+dateTmp+'")');
                        // }
                    }
                }
            }

            if (keyValues.length > 0) {
                var sValues = keyValues.join(",");
                var sql = 'INSERT OR REPLACE INTO key_data (id,pkey,focus,lift,amount,updated) VALUES ' + sValues;
                TB._pDb.transaction(function(tx){
                    tx.executeSql(sql,[],function(tx,rs){
                        if (bIsEnd) {
                            TB._fFinish();
                        }
                    },
                    function (tx,err){
                        console.log(err.source +'===='+err.message);
                    });
                });
            }
        }

    };

    TB._fGetSuggestions = function(sKeyNew,rows,bIsEnd){
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
                    TB._fGpdateDBKeyData(rows,response,bIsEnd);
                }
            }
        });
    };

    TB._fUpdateAmount = function(){
        var sql = 'SELECT * FROM key_data WHERE amount=0 AND updated="'+
            TB._oUtils.fGetDateString() + '"';
        TB._pDb.transaction(function (tx){
            tx.executeSql(sql,[],function(tx,result){
                var resultRows = result.rows;
                if (resultRows.length>0) {
                    for (var i = resultRows.length - 1; i >= 0; i--) {
                        var sKey = resultRows[i].pkey;
                        var sKeyNew = TB._oUtils.fGetNewKey(sKey);
                        var bIsEnd = i == resultRows.length - 1 ? true : false;
                        TB._fGetSuggestions(sKeyNew,resultRows,bIsEnd);
                    }
                } else {
                    TB._fFinish();
                }
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
    };

    TB._fUrlManagerGetUrl = function(){
        var dateTmp = TB._oUtils.fGetDateString();
        var sql = 'SELECT * FROM url_manager WHERE status=0 AND updated="'+dateTmp+'" LIMIT 1;';

        TB._pDb.transaction(function (tx){
            tx.executeSql(sql,[],function(tx,result){
                if (result.rows.length==1) {
                    if (window.location.href.indexOf('top.taobao.com') >= 0) {
                        if (TB._oUtils.fUrlIsEqual(result.rows[0].url,window.location.href)) {
                            TB._fParseTop(result.rows[0].url);
                        } else {
                            window.location.href = result.rows[0].url;
                        }
                    }
                } else {
                    TB._fUpdateAmount();
                }
            },
            function (tx,err){
                console.log(err.source +'===='+err.message);
            });
        });
    };

    TB._fRun = function(){
        TB._fDatabaseInit();
        TB._fUrlManagerInit();
        TB._fUrlManagerGetUrl();
    };

    TB.fMain = function(){
        TB._oUtils.fDeleteCookie('t', '/','.taobao.com');
        TB._fGoTbTop();
    };

    //--------call main--------------
    TB.fMain();
});
