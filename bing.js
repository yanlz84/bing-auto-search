// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.26
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
var default_search_words = ["总书记寄语劳动者", "中国驻日本大使向日方提出严正交涉", "女子决定结束20年婚姻嫁给ChatGPT", "解锁五一假期的N种玩法", "普京：我总有一种想要揍人的冲动", "44岁郭晶晶出席活动女王气场全开", "女生输头孢过敏 自行拔针仍身亡", "巴菲特分享赚钱秘诀", "贾乃亮全家出游 被猜与李小璐复合", "五一假期天安门广场游人如织", "夫妻吵架丈夫被扔高速上手机也没带", "重庆轨道交通有站点塌陷？假", "印度一公牛骑走路边摩托车", "美中情局发中文视频招募间谍被嘲", "马丽哭着回应与沈腾CP被过分关注", "巴基斯坦呼吁中美俄等介入印巴危机", "萨巴伦卡两盘击退高芙加冕冠军", "马丽感谢沈腾老婆和自己的老公", "美国科学家：终于从中国借到了月壤", "运动会后集体退演出服是谁的馊主意", "女生手机自动连上酒店WiFi被分手", "中国公民在美车祸身亡 目击者发声", "德甲：拜仁3-3莱比锡", "吉达国民获得亚冠冠军", "欠200万老赖冒用身份坐高铁被拘5日", "美国选手打破刘翔纪录 12秒87夺冠", "跳水世界杯总决赛今日收官", "酒店爆满 游客住进文旅局局长家", "巴菲特：未来五年或迎来现金配置良机", "“胖都来”开业是否侵权胖东来", "特朗普把自己P成了教皇", "巴菲特建议年轻人别在意起薪", "全红婵老家盖小洋楼 目测两百平", "五问舆论漩涡中的协和“4+4”模式", "巴菲特谈美股崩盘：根本不算啥", "灵隐寺8.5平米小卖部年租金260万", "巴菲特计划在年底退休", "登山神器续航8小时省力近50%", "云南抹黑节狂欢：他们连狗也不放过", "阿拉维斯0比0马竞", "大叔25年卖600万个鸡蛋饼挣4套房", "五一节后A股怎么走", "2025五一档电影票房破5亿", "皇马对阵塞尔塔大名单出炉", "英冠：利兹联夺冠携手伯恩利升级", "巴菲特的接班人什么来头", "丁程鑫跳《星奇摇》害羞了", "9米长林肯车堵瘫网红公路 车主致歉", "五四青年节张桂梅给青春的演讲", "王星越画技惊艳猜中白鹿", "以军将大规模征召预备役部队"]

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
