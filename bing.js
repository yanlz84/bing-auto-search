// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.92
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
var default_search_words = ["西湖龙井如何“撩”动全世界", "马斯克：特朗普应该被弹劾", "特朗普威胁终止对马斯克的政府补贴", "中国造船业为何能逆袭", "牛弹琴：这次通话10个很不寻常的细节", "马斯克与特朗普如何反目成仇", "#国足无缘世界杯谁应负责#", "特朗普：欢迎中国留学生来美学习", "范志毅吐槽国足：球怎么能传成这样", "高考遇上高温天 “防暑指南”来了", "马斯克：特朗普涉爱泼斯坦案", "校园公共事务的谣言应对小技巧", "特斯拉市值蒸发超1500亿美元", "西子电梯总裁坠楼离世 警方排除刑案", "朝鲜侧翻驱逐舰已被扶正", "哈佛大学决定再次起诉美政府", "桂林多地听到砰砰巨响", "苏超的热闹不只是因为踢得好", "国足0-1不敌印尼 无缘世界杯", "郭碧婷想和谢依霖换老公", "前妻控诉张纪中离婚转移三亿资产", "范志毅问国足拿什么去赢印尼队", "特朗普：短时间难以促成俄乌立即停火", "俄被炸机场现状曝光 图-95成灰烬", "公开骂架！特朗普：马斯克“疯了”", "央行开展1万亿元买断式逆回购操作", "肖战《藏海传》开分7.1", "曝马斯克曾寻求在白宫留任 遭拒绝", "美军举行“立即响应25”大规模军演", "范志毅失望劝球迷早点睡", "16次高考的唐尚珺称已融入大学生活", "国足已连续6届无缘世界杯", "34岁网红村花突发急性脑梗去世", "金正恩承诺对俄无条件支持", "新冠疫情在一些省份出现下降趋势", "中方回应美国全面限制12国公民入境", "尼克斯与杜兰特有相互合作意愿", "美商务部长：对等贸易实为针对中国", "申方剑批朱辰杰：正追分呢慢悠悠溜达", "高昉洁印尼公开赛晋级女单八强", "机构人士：港股市场有望打破折价怪圈", "老人在精神病院被挖伤双眼右眼失明", "《野狗骨头》张婧仪刘海校服路透", "热销的“踩屎感”鞋正在毁掉你的脚", "日本民间企业月球着陆器失去联系", "李在明就任后他俩破防了", "全身瘫痪小伙带全家住集装箱种菜", "鹿晗工作室发布郑重声明", "黄健翔谈国足无缘美加墨世界杯", "萨巴伦卡首进法网决赛", "女网红违停并跳上警车被行拘"]

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
