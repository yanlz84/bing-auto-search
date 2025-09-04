// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.272
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
var default_search_words = ["与习近平握手的6位老英雄是谁", "台湾艺人集体转发九三阅兵", "“中国排面”再现人民大会堂", "纪念抗战胜利80周年大会完整视频", "军事专家：知道强 但没想到强成这样", "东风-5C有多强？官媒9年前披露过", "多国来华领导人接连发声", "造一架阅兵中的舰载机有多难", "钟南山不到2岁时房子被日本飞机炸塌", "中国排面给全世界亿点点震撼", "普京让泽连斯基准备好了就去莫斯科", "警方辟谣领育儿补贴需先交保证金", "受阅人员装备退场 群众街头夹道欢送", "阅兵最帅女机长 是她", "九三文艺晚会超50%演员是00后", "张家界武陵源区天坑垃圾问题难整治", "华春莹与记者互动：我的心情和你一样", "金正恩只回了韩议长一个字", "东风-5C核导弹凭何压轴出场", "台退将看阅兵新装备直呼自己是军盲", "多地上调最低工资标准", "妈妈在上百人的方阵中一眼认出儿子", "人手一个瞄准镜意味着什么", "九三阅兵解锁了这些“首次”", "5万余人观礼离场后干干净净", "普京称其访华取得积极成果", "孙中山后人现场观礼九三阅兵", "受阅部队跑步登车画面被怒夸", "间谍张某某死缓：出轨外国女官员生子", "南部战区回应菲澳加联合巡航", "当萌娃遇上九三阅兵", "埃文凯尔看受阅飞机：不可思议", "歼-35与歼-35A两款战机各有何特点", "九三阅兵引发新加坡华人热烈反响", "新华社出长长长图了", "霍震霆：父子同场见证盛事是一种光荣", "在北京街头和东风-61“擦肩而过”", "坦克到底有没有后视镜", "“海空卫士”王伟遗孀在京观看阅兵", "北京感谢全市人民和首都各界", "介文汲谈东风-61导弹：连跳两代", "古巴国家主席中文发帖：深感荣幸", "揭秘大会现场花卉如何做到精神抖擞", "武契奇来华出席阅兵后发帖感谢中国", "演员何政军谈《亮剑》赵刚", "张雨霏晒阅兵现场照", "东风26D从北极飞南极不到3个半小时", "“防霸凌”儿童指纹水杯被吐槽费妈", "韩议长在北京与金正恩碰面并握手", "郭帆“边看阅兵边改剧本”", "九三晚会《这束光》让人充满力量"]

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
