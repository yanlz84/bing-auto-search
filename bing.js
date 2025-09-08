// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.281
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
var default_search_words = ["牢记统帅嘱托 建设一流军队", "被中方宣布制裁的石平是谁", "外交部评石平：数典忘祖出卖良知", "一条古道 一面战旗 一个村庄", "人民日报谈“禁带电话手表到学校”", "金正恩访华纪录片展示东风-5C", "净网：女子摆拍嫁到国外贫民窟被罚", "西藏一县有垃圾场现大量藏马熊觅食", "女子20元彩票刮中100万激动尖叫", "俄方：普京访华期间每天只睡几小时", "中国最重要的五大城市群 定了", "“新疆和田开挖地铁”系谣言", "网友拍的血月太抽象了", "开学季著名景点：“爸拿马运河”", "浙江大学6000余名新生深夜行军", "柯文哲交保出狱 大骂赖清德", "许荔莎喊话许凯：我们两个要进去一个", "上海暴雨 白昼瞬间变黑夜", "王力宏新女友疑曝光", "iPhone 17电池容量曝光 美版更大", "股市反腐微短剧《K线成长记》来了", "许凯方回应被曝聚众赌博", "吧友提前爆料许凯赌博", "许凯目前有3部待播剧", "复旦大学鹅肝汉堡爆火", "育儿补贴申领正式全面开放", "女子炫耀多次带打火机登机 警方通报", "#谁最可能接替石破茂成日本新首相#", "中方回应石破茂宣布辞职", "山姆回应顾客自带桶免费续杯饮料", "为什么微信上那么多人住在安道尔", "广东全省累计转移6万余人", "女子高铁上脱鞋 举起双脚做拉伸", "女子点绿茶餐厅外卖被贴“装货”", "曝杨祐宁父亲患癌症", "华裔数学家被迫筹款：或失去留美信心", "石破茂辞职 特朗普：有点吃惊", "超300名韩国人在美被捕 特朗普回应", "女子炫耀多次带打火机登机被行拘", "李在明就韩公民在美被拘事件作指示", "泰国新任总理向国王画像行跪拜礼", "山东一村干部催缴费时辱骂村民", "曝许凯赌博赢钱后绯闻女友收款", "人民法院报：赌博是社会毒瘤", "广西16岁女生离校后失联", "黑龙江一地现长条滚筒状“怪云”", "女兵退伍归来深情告白男友", "司法部：清理不利于统一大市场法规", "目前中国有律师83万 仲裁员6.7万人", "中方：美方对外交往以大欺小恃强凌弱", "3款iPhone17背面或配副屏"]

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
