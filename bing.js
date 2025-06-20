// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.121
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
var default_search_words = ["中国中亚关系发展展现坚实确定性", "外交部回应大陆24小时派出46架战机", "多名干部聚餐饮酒致1死 中央通报", "“三夏”里的新质生产力", "人民日报：让韦东奕们好好吃口饭", "贷款40万开蛋糕店7个月遇洪水倒闭", "2025年净网护网专项工作部署会召开", "金世佳上戏考博上岸", "伊朗袭击以色列“网络首都”", "网传凤凰传奇今年演唱会全部取消", "#打伊朗为何特朗普又犹豫了#", "广州一外卖骑手猝死？谣言", "清华回应女教授被树砸身亡", "伊朗导弹再次击中以色列南部城市", "中国留英博士下药强奸多人被判无期", "中国留学生迷奸10人 受害者发声", "48岁演员郭品超回山东老家收麦子", "市监局回应赵一鸣零食店遭哄抢", "高圆圆带女儿在巴塞罗那吃麻辣烫", "牛弹琴：特朗普又改主意了", "人机结合填志愿 让每一分都算数", "退学北大716分上清华男生发文", "伊朗逮捕30名与摩萨德有关间谍", "凤凰传奇：曾毅身体不适演唱会取消", "面临罢免的泰国总理佩通坦何去何从", "周继红任国家跳水队总教练", "于正回应在二手平台上招素人演员", "泰国民众举行示威：要求佩通坦辞职", "伊朗警方逮捕24名从事间谍活动人员", "东部战区回应英舰过航台湾海峡", "黄晓明回应考博落榜：明年再战", "特朗普将在两周内决定是否攻击伊朗", "伊朗9名核科学家睡觉时被暗杀", "以军称空袭伊朗西部多处导弹设施", "首架接撤离伊朗中国公民航班抵京", "以称伊朗试图袭击欧洲的以色列目标", "伊朗公布新一波导弹袭击视频", "俄男子1500米高空表演单杠大回环", "桂林市委原书记周家斌被双开", "以军大规模空袭伊朗西北部战略要地", "以色列边炸伊朗边打加沙", "外交部宣布：黄循财将访华", "38岁女子秦岭徒步失联5天", "小沈阳女儿想成为下一个Jennie", "郭正亮：以色列拉美国下水几率不高", "GAI还是带上墨镜唱歌吧", "荣耀MagicV5折叠屏外观公布", "商家极端应对仅退款：先损坏才能退", "伊朗德黑兰市中心防空系统启动", "夏至来了 广东可体验“立竿无影”", "湖南龙山暴雨致37名中考生缺考"]

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
