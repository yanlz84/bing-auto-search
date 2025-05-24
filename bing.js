// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.67
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
var default_search_words = ["要切实整治形式主义为基层减负", "特朗普24小时内连砍三刀", "钟南山谈大S离世：很遗憾", "民企“出海”成功的背后密码", "10多个省份鼓励实行2.5天休假模式", "孙颖莎4-0横扫伊藤美诚", "造谣“留学生强闯火车站”者被拘", "高中生与教授父亲共同署名发3篇SCI", "冯巩有新身份", "董明珠孟羽童合体带货500万元", "2.5天休假模式真的来了", "高速上演“刀片超车” 两车瞬间报废", "英国女子旅游时去世 回国后心脏没了", "被270万网友严选的新生军训服", "哈佛禁令引众怒 中国学生不敢离校", "研究发现地核正在泄漏黄金", "林志炫被淘汰到底哪里出了问题", "演员黄兆欣猝死离世 曾与琼瑶合作", "王曼昱回应打哭张本美和", "陪看：直击2025多哈世乒赛", "中国首艘弹射型航母正加紧海试", "美国称朝鲜处于数十年最强战略地位", "接连有孩子因“棍棒教育”离世", "央视曝光上门免费服务骗局", "郝蕾：不红就是原罪红了怎么都对", "张本美和：真切感受到王曼昱的强大", "广西龙胜山洪已致4人遇难", "孟子义：人怎么能聪明成这样", "美军夜间试射洲际导弹 打到太平洋", "武汉一汽车暴雨中“吃井盖”", "华人遭抢劫 枪战15分钟击退劫匪", "步行者击败尼克斯大比分2-0领先", "婚房被粪水浸泡 业主崩溃", "存款利率0字头时代 钱放哪收益高", "人在ICU被写欠条 真正借款人找到了", "王楚钦若夺冠仍无法重返世一", "吴彦祖首次公开上海新家", "孙颖莎没想到会轻松赢下比赛", "吴京环塔感悟：还是要敬畏生命", "哈佛已离境留学生或无法返美", "游泳冠军赛多项目决赛", "王楚钦男单半决赛对手出炉", "洛阳博物馆“牵手女俑”热度不减", "近八成银行高管降薪 最高降幅82.4%", "饲养员办公室和虎舍仅一窗之隔", "JCK觉城之夜N99", "外国记者直呼中国产的手机都太值了", "成都女子家门口遇害案将开庭", "知情人谈悉尼多名青少年殴打华人", "特朗普：哈佛很多学生连2+2都不会", "马龙也玩谐音梗"]

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
