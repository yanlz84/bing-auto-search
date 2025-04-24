// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.7
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
var default_search_words = ["习近平同肯尼亚总统鲁托会谈", "神舟二十号载人飞船发射", "美舰过航台湾海峡 解放军跟监警戒", "请查收这份“宇宙级”成绩单", "上海车展中东土豪扫货：国王开中国车", "邓超在家喊胡曼黎被孙俪骂", "如何防范“职业窃密人”", "曝小米要求员工日均工时不低于11.5", "印度宣布报复：断水停签驱离", "丁真惹怒曾志伟", "美财长：目前税率如同贸易禁令", "上海车展有人打架？不实", "周鸿祎回应卤鹅哥上海车展投喂", "中方回应美对华关税降幅或超一半", "马斯克谈自动驾驶：不碰撞是第一要义", "收黄金纪念章 落马部长唐仁健被点名", "神舟二十号航天员报告感觉良好", "30岁华裔将成最年轻白手起家女富豪", "外卖员撞死未牵绳宠物狗被打", "男子患脚气闻袜子后感染进医院", "枪击事件后印度巴基斯坦齐发声", "赵露思上海CT活动", "航天员在歌唱祖国旋律中出征", "美国新泽西州遭近20年最严重山火", "山西被虐致死男童生母继父均为主犯", "央行行长在美谈关税问题", "985硕士求职被拒只因本科双非学历", "南方持续多雨模式 北方气温多起伏", "孙俪新剧上演被婆家偏爱的儿媳", "学者：文在寅和李在明“命悬一线”", "35岁脑干出血程序员发声", "商务部回应中美关税降温说法", "特斯拉利润暴跌71% 马斯克叹了口气", "《蛮好的人生》窝囊男搞不定极品亲戚", "中国航天人：给神二十发射打120分", "高考被顶替的5旬辅警错过母亲下葬", "全过程回顾神二十载人飞船发射", "骑手提醒外卖送得快不一定是好事", "多国政要将出席方济各葬礼", "谢霆锋演唱会将再唱与王菲定情曲", "《无忧渡》久宣夜向段半夏求婚", "在中美之间二选一 韩国表态", "马丽《水饺皇后》与臧健和适配度好高", "外国小哥被上海车展的中国车硬控", "盲盒卡牌赚了小学生100亿", "黄圣依晒15岁照片 齐肩短发笑靥如花", "美10余州起诉特朗普政府滥用关税", "张继科说王励勤训练永远第一个到", "中方在联合国呼吁反对美国单边霸凌", "陈冬上太空前发了朋友圈", "外交部：敦促菲方不要再折腾"]

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
