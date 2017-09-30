# -Tampermonkey

```
用浏览器采集数据
	优点
		可以采集如何网站的数据，只要在浏览器中能看到的都能采集，不怕反爬虫。
	js实现
		使用Tampermonkey（chrome），执行外部js来爬取。
		并把爬取的数据出入h5的本地存储数据（sqlite）中。
		最后用GM_xmlhttpRequest，跨域提交（拉取）到外部网站。（https://wiki.greasespot.net/GM_xmlhttpRequest）
	h5的本地存储（sqlite）
		浏览器支持情况
			http://caniuse.com/#feat=sql-storage
			http://caniuse.com/#feat=indexeddb
		存储地址（chrome）
			C:\Users\USERNAME\AppData\Local\Google\Chrome\User Data\Default\databases
		h5的本地存储操作
			http://blog.csdn.net/panda_m/article/details/49951555?ref=myread
		sqlite数据 查看转存
			用SQLiteStudio处理
		*注意
			本地数据在清理浏览器缓存时会一并清理掉
```
