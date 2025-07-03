// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.147
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
var default_search_words = ["自我革命这根弦必须绷得更紧", "“起猛了 航母开楼下了”", "14岁屡教不改 法律出手了", "这些电视剧和文艺节目值得关注", "“已有8艘船只驶往中国”", "小米又用“1999元起”试探年轻人", "高考志愿填报启动 网警继续护航", "人民日报评宋佳白玉兰奖获奖感言", "河南出门像行走的水煮蛋", "夫妻计生系统凭空多个小孩 多方回应", "成都暴雨红色预警", "壶口瀑布毛驴遭投诉动作不雅？假", "俄海军副司令阵亡", "北京出门像被牛舔了一口", "天津航空客机起飞疑发巨响 紧急刹停", "王欣瑜止步温网女单第二轮", "甘肃一幼儿园用添加剂致幼儿血铅异常", "派出所回应K1373次列车停滞3小时", "中方回应美国与越南达成贸易协议", "60岁老戏骨辅导4年级女儿 直呼太难", "马筱梅回应禁止大S子女去范玮琪家", "上海交大冲突事件引校门开放之争", "富士康为何让中国员工撤离印度工厂", "日本一火山喷发 火山灰柱高达5000米", "颖儿做了割胆手术", "利物浦前锋若塔因车祸离世", "王祖贤清唱《倩女幽魂》梦回聂小倩", "直击甘肃陇南大暴雨 洪流卷走汽车", "血铅含量超标可能引发多器官损伤", "被骗缅甸模特曾让家人帮充话费", "#直击湖北灾后现场#", "山东舰航母抵达香港 停满舰载机", "富士康要求中国员工从印度撤离", "访港航母编队超强阵容自我介绍", "被停职的佩通坦宣誓就任泰文化部长", "高考成绩可查20年是人生枷锁吗", "成都大暴雨多地积水 市民划船出行", "中方回应特朗普拟带企业团访华", "12岁男孩暴雨中被网约车司机扔半路", "李在明批准金民锡出任总理", "#学者建议取消中考和普职分流#", "叶一茜晒女儿打网球照", "利物浦官方发文悼念若塔", "山东舰抵港 甲板排出“国安家好”", "曝娜扎张云龙近况", "男子在国道偶遇东北虎", "“塑料金砖”乐高已成过去式", "李钺锋受贿9342万被判无期", "桑拿天要小心“夜间热浪”", "C罗发文哀悼利物浦前锋若塔", "南京奥体6万多个座椅都擦了一遍"]

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
