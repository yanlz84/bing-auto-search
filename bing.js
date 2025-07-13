// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.166
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["向海图强 总书记心系这片“蓝”", "点20单外卖其中17单“0元购”", "大同大学10人将被解聘注销事业编制", "落锤时刻！看西夏陵申遗成功现场", "被骗至缅甸失联的高考生行程曝光", "陈道明头发全白了", "特朗普突然宣布 越南领导层措手不及", "女子拼车遇猥亵上演教科书式反制", "美国大满贯女单太“冷”", "素人女孩被拍网友喊话于正", "外卖大战周末重启 如此惨烈值得吗", "海南电动车头盔分春夏冬三款？假", "陈熠4比3蒯曼晋级决赛", "基辅上空出现一架“神秘飞机”", "3万亿公积金放大招了", "3000万辆中国汽车利润不及丰田1家", "周深回应《奔跑吧》遭拖拽", "赵雅芝谈不扮白素贞造型原因", "侃爷上海演唱会嫌雨太大提前退场", "男子在瀑布求婚 还没跪下就被冲走", "中国女排逆转德国获三连胜", "手术后脑死亡男童母亲发声", "盟友强硬回怼特朗普关税威胁", "台湾制火箭在日本发射失败 画面曝光", "国足0-2不敌日本", "朱雨玲淘汰伊藤美诚晋级决赛", "陈熠回应晋级决赛", "“侃爷”上海演唱会迟到 观众喊退票", "学校回应校门外石墩加设钢管护栏", "招足球教练要博士 浙江体育局通报", "郭艾伦对周深说怕给你弄疼了", "马克龙：反对美国向欧盟征收30%关税", "钟丽缇为43岁丈夫张伦硕庆生", "王毅用3个“不”字谈美加征关税", "鹿晗回应“海淀把妹王”", "周深录综艺被郭艾伦拖拽 粉丝控诉", "美国务院大裁员 员工含泪离开", "国足对阵日本现场观众仅1661人", "杨瀚森NBA首秀填满数据栏", "以色列想打胡塞 美国想吗", "特朗普：暗杀者不到5秒就被击毙", "韩美日举行联合空演 美军B-52H参加", "外卖闪击战变持久战 网友：胖好几斤", "失业想领补贴发现自己是2家公司老板", "缅北果敢白家为何如此猖獗", "外卖大战有骑手一天赚1000多元", "金正恩会见俄外长", "陈慧琳郑秀文世纪同台", "F4在五月天演唱会合唱《流星雨》", "特朗普称对墨西哥、欧盟征收30%关税", "杨瀚森夏联首秀背后藏着这些细节"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
