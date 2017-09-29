// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://top.taobao.com/*
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

    //switch_tab();return false;

    //deal_gm();return false;

    go_top();

    //----------deal GM-----------------
    function deal_gm(){
        GM_log(GM_listValues());
        var aGmName = GM_listValues();
        for( var i=0;i<aGmName.length;i++) {
            var sKey = aGmName[i];
            console.log(sKey+':'+GM_getValue(sKey));
            GM_deleteValue(sKey);
        }
        return false;
    }

    //---------to top--------------
    function go_top(){
        console.log('go_top');
        var index_url = 'https://www.baidu.com/?to_top=1';
        var sToday_fetched = GM_getValue("sToday_fetched");
        if (window.location.href==index_url) {
            if (!sToday_fetched) {
                var sHtmlA = '<a id="go_top" target="_self" href="https://top.taobao.com/index.php?topId=TR_FS&leafId=50012032">to top</a>';
                $("#lg").before(sHtmlA);
                $('#go_top')[0].click();
            }
        } else {
            if (!sToday_fetched) {
                main();
            }
        }
    }

    //---------today fetched-----------
    function today_fetched(){
        console.log('today_fetched');
        var myDate = new Date();
        var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
        var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        var date = myDate.getDate();        //获取当前日(1-31)
        var today_fetched = 'fetched_'+year+'_'+month+'_'+date;
        var yestoday_fetched = GM_getValue("sToday_fetched","");
        if (yestoday_fetched==today_fetched) {
             return true;
        } else {
            return false;
        }
    }

    //---------to fetch-------
    function main(){
        console.log('main');
        get_last_file_name();
        //------to fetch------
        get_mulit_page();

        //------to save---------

        if (is_end_page()) {
            var sFileName = GM_getValue("sLastFileName","");
            save_to_file(sFileName);
        } else {

        }


    }

    //---------is end page--------------
    function get_last_file_name(){
        console.log('get_last_file_name');
        var myDate = new Date();
        var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
        var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        var date = myDate.getDate();        //获取当前日(1-31)
        var rank = getUrlParam('rank')==null ? 'sale' : getUrlParam('rank');
        var type = getUrlParam('type')==null ? 'up' : getUrlParam('type');
        var leafId = getUrlParam('leafId');
        var sDate = leafId+'_'+rank+'_'+type+'_'+year+'-'+month+'-'+date+'.csv';
        //console.log(sDate);return false;

        var sFileName = GM_getValue("sLastFileName","");
        var sTabName = rank+'_'+type;
        var sYesTodayLastFileName = GM_getValue(sTabName,"");
        if (sFileName=="") {
            sFileName = sDate;
        } else {
            if (sFileName==sYesTodayLastFileName) {
                return false;
            } else {
                sFileName = sDate;
            }
        }

        GM_setValue("sLastFileName",sFileName);
    }

    //---------is end page--------------
    function is_end_page(){
        console.log('is_end_page');
        var active_next = $('.items .item.active').next();
        if (active_next.hasClass('next')) {
            return true;
        } else {
            return false;
        }
    }


    //--------save to file-----
    function save_to_file(sFileName){
        console.log('save_to_file');
        var str = GM_getValue("sRows","");
        str =  encodeURIComponent(str);
        var oDownloadA = $('.switch-item').first().find('a');
        oDownloadA.attr('download', sFileName);
        oDownloadA.attr('href', "data:text/csv;charset=utf-8,"+str);
        oDownloadA[0].click();
        GM_setValue("sRows","");
        GM_setValue("sLastFileName",sFileName);

        var myDate = new Date();
        var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
        var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        var date = myDate.getDate();        //获取当前日(1-31)
        var rank = getUrlParam('rank')==null ? 'sale' : getUrlParam('rank');
        var type = getUrlParam('type')==null ? 'up' : getUrlParam('type');
        var leafId = getUrlParam('leafId');
        var sDate = leafId+'_'+rank+'_'+type+'_'+year+'-'+month+'-'+date+'.csv';
        var sTabName = rank+'_'+type;
        GM_setValue(sTabName,sDate);
        //GM_log(GM_listValues());return false;

        switch_tab();
    }

    //-----------switch_tab--------------
    function switch_tab(){
        var oNext = $('.switch-item-selected').next();
        var has_next = oNext.length;
        if (has_next==1) {
            oNext.find('a')[0].click();
        } else {
            switch_category();
        }
    }


    //-----------switch_category--------------
    function switch_category(){
        console.log('switch_category');
        var oNext = $('.block-expand .params-cont .param-item-selected').next();
        var has_next = oNext.length;
        if (has_next==1) {
            oNext[0].click();
        } else {
            var myDate = new Date();
            var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
            var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
            var date = myDate.getDate();        //获取当前日(1-31)
            var today_fetched = 'fetched_'+year+'_'+month+'_'+date;
            GM_setValue("sToday_fetched",today_fetched);
        }
    }

    //--------get mulit page-----
    function get_mulit_page(){
        console.log('get_mulit_page');
        get_one_page();
        if (is_end_page()) {
            //return false;
        } else {
            var active_next = $('.items .item.active').next();
            var href = active_next.find('a').attr('href');
            window.location.href=href;
        }
    }

    //---------get one page------
    function get_one_page(){
        console.log('get_one_page');
        var rows = new Array();
        $('.J_contentRow .row').each(function(){
            var title = $(this).find('.col2 .title').text();
            var focus_bar = $(this).find('.col4 .focus-bar').text();
            var up_down = $(this).find('.col5').text();
            var up_down_icon_tmp = $(this).find('.col5 .icon-btn-bang-1-trend icon').length;
            var up_down_icon = up_down_icon_tmp==1 ? '+' : '-';
            var up_down_percent = $(this).find('.col6').text();
            var up_down_percent_icon_tmp = $(this).find('.col6 .icon-btn-bang-1-trend icon').length;
            var up_down_percent_icon = up_down_percent_icon_tmp==1 ? '+' : '-';

            //var row = title+','+focus_bar+','+up_down_icon+up_down+','+up_down_percent_icon+up_down_percent+"\n";
            var row_array = new Array();
            row_array.push(trim(title));
            row_array.push(trim(focus_bar));
            row_array.push(trim(up_down_icon)+trim(up_down));
            row_array.push(trim(up_down_percent_icon)+trim(up_down_percent));
            var row = row_array.join(',');
            rows.push(row);
        });

        var sRows = rows.join("\n");
        var sRowsNew = GM_getValue("sRows","") + sRows + "\n";
        GM_setValue("sRows",sRowsNew);
    }

    // ------unit funciton-------
    function trim(str)
         {
             return str.replace(/(^\s*)|(\s*$)/g, "");
     }

     function getUrlParam (name) {
          var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
          var r = window.location.search.substr(1).match(reg);
         //console.log(window.location.search);return false;
          if (r != null) return unescape(r[2]); return null;
     }
});
