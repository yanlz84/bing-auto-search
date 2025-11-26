// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.439
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
var default_search_words = ["中国影响力", "中国军号发布视频：导弹起竖", "中方回应是否指示减少赴日航班", "一组海报看我国冰雪产业发展新阶段", "日本前首相石破茂再批高市早苗", "男子买刮刮乐中奖10万元老板不承认", "网警查处编造民宿现感染源谣言者", "辽宁披露：见死不救的局长已被查", "全军统一制发《预备役人员证》", "李家超就香港火灾事件发声", "上海地铁回应多名外国人车内吃馅饼", "重庆三峡之巅突降冰雹系谣言", "成都市市长王凤朝被查", "中方回应是否请特朗普向高市传口信", "女子挑战不花钱生活 被餐馆老板教育", "男子抛妻弃子20年欠40万 儿子拒还", "香港大埔火灾有居民称与妻子失联", "《疯狂动物城2》预售票房超《哪吒2》", "冷美人出院：坐车回家看两个孩子", "岳云鹏夫妇公司欠税14万被公告", "外交部回应日本针对中国公民犯罪多发", "十秒分清甲流和普通感冒", "受贿6793万余元 杜玉波一审被判15年", "香港宏福苑居民曾看到维修工人抽烟", "香港大埔火灾升至五级", "今年甲流为何如此凶猛", "61岁儿子用车拉100岁父亲晨练", "8岁女童化粪池遇难 家人不敢告诉奶奶", "“未来黑科技”全固态电池到底是啥", "国台办回应郑丽文忧虑", "上海一证券从业者被骗2000多万", "云南一荒野求生大赛被官方叫停", "多艘中国邮轮变更前往日本航线", "特朗普称不再给乌克兰设最后期限", "日本升级武器 图谋极具危险性", "泰国遇洪灾：巨蛇在洪水中游动", "日本最高摩天轮突遭雷击紧急停运", "外交部：再次敦促日方收回错误言论", "俄称已从非正式渠道获取和平计划材料", "中国距离在月球盖房更近一步", "中部战区发布硬核“烟花秀”", "郑伊健日本演唱会取消", "特朗普：28点和平方案已缩减至22点", "东契奇首节轰24分破湖人队史纪录", "#流感来袭症状日记#", "邓炳强：对殉职消防员深感悲痛", "铁钉在男子支气管内10年被取出", "A股收盘：创业板指涨2.14%", "堪察加半岛一火山喷发 灰柱1万米高", "中保协发布“安我股保”风险提示", "贵州一煤矿6年“盗采”百万吨煤炭"]

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
