// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.110
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
var default_search_words = ["他鼓励我们当好中亚友谊使者", "伊朗最高领袖高级顾问遭以袭击离世", "伊朗对以色列发动新一轮导弹袭击", "高校毕业生如何“就好业”", "知名主持人金昀去世 年仅43岁", "以色列国家安全总局局长巴尔辞职", "男孩树下睡觉 被印坠毁客机砸中烧死", "张子枫脚踩20cm高跟鞋走红毯", "特朗普：和普京都认为以伊冲突该结束", "模特张亮与10岁女儿合拍杂志大片", "伊朗夜袭以色列 导弹密集夜空变白昼", "高考扁担女孩开通社媒账号？假", "撕裂！直击全美反特朗普抗议活动", "伊朗革命卫队：将继续袭击以能源设施", "北京暴雨故宫再现千龙吐水", "以色列称空袭伊朗国防部总部", "伊朗开火报复 以总理专机却飞去希腊", "台网红“馆长”：两岸永远是一家人", "杨幂顶级高定配酒店一次性拖鞋", "郑钦文遗憾止步四强 无缘决赛", "曾毅名下7家公司均注销或被除名", "以色列进入“前所未有紧急状态”", "伊朗称逮捕以色列F-35战机飞行员", "杭州女子遭劫持被捅多刀 警方通报", "陈小春晒演唱会幕后vlog", "以色列暗杀胡塞高级领导人失败", "国安球迷巨型TIFO致敬张稀哲", "央视披露福建舰最新消息", "男子鸣笛引不满 强行驶离致1死4伤", "以色列伊朗持续互袭", "火箭3年3900万续约亚当斯", "美得州政府疏散州议会大厦等人员", "普京：俄准备调解伊以冲突", "杨幂挽着刘德华疑似林萧上身", "前国脚斥工资太低：再降就没人踢了", "以袭击伊朗后美为何不断催促谈判", "哈妮克孜颜安吻戏巨好嗑", "南京摇来朱元璋岳飞孙权助阵", "杨幂：能和刘德华一起走红毯了", "以色列空军对也门和伊朗发动袭击", "章子怡短发造型变化巨大", "德黑兰遭以军袭击 传出巨大爆炸声", "中亚五国青年大声表白中国", "英国将喷气式飞机等资源向中东转移", "伊朗向美英法发出警告", "网红泰国商场直播带货被查", "商家虚假上报已出餐 骑手询问遭辱骂", "以军称已打死20余名伊朗指挥官", "男子非法收购出售保护鸟类获刑", "用水暴涨1500吨后发现两个水表", "商场遭挟持被捅女子：和绑匪不认识"]

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
