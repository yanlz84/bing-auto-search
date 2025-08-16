// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.234
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
var default_search_words = ["读懂“两山”理念的科学路径", "普京特朗普未达成协议", "特朗普普京会谈超两个半小时", "日本无条件投降原声", "B-2轰炸机编队飞过 普京特朗普观看", "《仙剑3》魔尊重楼扮演者去演短剧了", "净网：知道什么是“指尖陷阱”吗", "特朗普评价与普京会晤：打10分", "“普特会”谈近3小时 大阵仗有玄机", "居民存款减少1.11万亿去哪了", "会晤后 普京前往阿拉斯加一处墓地", "协和2名学生为某院士孙女？不属实", "特朗普普京在机场见面握手 同乘专车", "续面事件老板回应店面700余条差评", "特朗普机场迎接普京 握手超10秒", "四六级成绩今日公布", "会谈中记者疯狂提问 普京表情亮了", "特朗普：会向泽连斯基通报会晤情况", "特朗普迎接普京 红毯旁停F-22战机", "新华社评肖某董某莹事件：绝不姑息", "俄方：普京特朗普会谈非常顺利", "“恋爱都不想谈了” 新股民跑步入场", "女子5次试管后艰难怀孕却确诊肝癌", "记者直击美俄总统会晤现场", "普特会酒店爆满 俄媒体育馆睡大通铺", "普京：俄真诚希望冲突结束", "近10年俄罗斯总统首次踏上美国领土", "电梯施工人员惊现“谢霆锋刘德华”", "“越野跑大神”误食毒蘑菇身亡", "特朗普和普京分别启程离开阿拉斯加", "企业加班通知走红：所有人涨薪25%", "绵竹啤酒节发生桁架倒塌 致2死3重伤", "特朗普：乌将自行决定是否交换领土", "女子贪污700万打赏男主播只剩800元", "老太被女儿带出养老院盗取存款后续", "普京：希望乌欧勿试图破坏会谈", "尹锡悦穿囚服戴镣铐狱外就医", "12306回应下架泡面不如站台禁止吸烟", "深度解读美俄元首会晤地", "#普京想从特朗普手上得到什么#", "普京特朗普一对一会晤改三对三", "官方回应佛山内涝是因下水道防蚊网", "影院回应银幕遭男孩拍打：将报警索赔", "自闭症男孩参加夏令营遇难背后", "社区回应张靓颖旧居楼道被粉丝乱画", "女子称与小孩冲突被对方家长殴打", "苏-57与F-22战机可能首次正面相遇", "市民称无人机逐层偷拍居民楼", "姚明现身浙BA城市争霸赛", "梁靖崑：球稍微变大了一些", "赖清德歪曲二战历史 国台办回应"]

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
