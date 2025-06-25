// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.131
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
var default_search_words = ["“耕地是粮食生产的命根子”", "各地高考分数线出炉", "伊朗防长现身青岛", "我在达沃斯认识了这些黑科技朋友", "哥哥上北大弟弟考702准备报清华", "非法集资911亿 盘继彪被判无期", "成绩被屏蔽考生曾苦恼怎么学都第一", "中方回应特朗普要中国买美国石油", "张译新剧《以法之名》太敢拍了", "中国足协被亚足联处罚", "伊朗称核设施在美国空袭中严重受损", "考生注意！志愿填报别踩这些坑", "9岁女童被打碎头骨母亲发声", "宁静称汪峰不是她的菜", "伊朗将领“起死回生”现身胜利集会", "邱贻可勉励考生：握紧人生发球权", "黄子韬工作室发声明否认代孕", "山东高考分数线公布", "一个班3人高考成绩屏蔽 老师们沸腾", "黄子韬徐艺洋孩子疑首曝光", "女子举报前公婆近亿资产涉贪1年无果", "“救助百名弃婴的和尚”涉嫌诈骗", "特朗普：若伊朗重启核计划将再度打击", "找张雪峰报志愿 又涨价了", "高考601分脑瘫男孩回应热议", "张译李光洁《以法之名》首播即爆", "实拍洪水过后的贵州榕江", "#洪水中的贵州榕江在呼救#", "梁实第29次高考差本科线13分", "脑瘫男孩高考601分母亲发声", "黄子韬徐艺洋方已取证", "男生高考查分查出隐藏款超淡定", "苹果直营渠道首次参与国补", "男生复读3年高考查分喜极而泣", "#酱园弄开分不到6到底烂在哪#", "老头乐成为县城小伙的精神迈巴赫", "四川2025年高考分数线公布", "安徽高考分数线公布", "中方回应对以色列和伊朗停火立场", "韩国法院驳回尹锡悦逮捕令", "北京高考分数线公布", "榕江最大商场被淹 老板：100万打水漂", "一图看懂以伊冲突停火始末", "女儿被打碎头骨 网友威胁其母亲被拘", "女生考超600分 放榜时在酒楼端盘子", "李在明用《西游记》告诫韩国官员", "吉林高考分数线公布", "江西高考分数线公布", "贵州高考分数线", "四川宜宾发生4.5级地震", "柬埔寨公主深圳遛电子狗：太有趣了"]

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
