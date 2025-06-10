// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.100
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
var default_search_words = ["让“干坡坡”变“金窝窝”", "DeepSeek核心高管已离职创业", "福建一楼房发生爆炸 有人员被困", "让正能量成为网络空间主旋律", "“恭迎大小姐高考归来”", "任达华回山东老家收麦子", "网警护航 高考个人信息安全指南来了", "演员秦海璐在《人民日报》撰文", "小孩被天降乌龟砸死 饲主判赔128万", "带你看懂5月CPI和PPI数据", "大爷5块钱买折叠沙发到手竟是支笔", "贵州“村超”被足协叫停？谣言", "中美经贸磋商机制首次会议将继续进行", "新房在小姑子名下 准新娘直接退婚", "老师参加高考：不过640分请学生吃饭", "一文总结苹果WWDC大会：没有惊喜", "考生高考结束现场集体找妈妈", "高考结束 考生最想做的事是带孩子", "张靓颖工作室致歉", "程潇给前任发信息被秒回", "曝某大花戛纳扇助理耳光", "洛杉矶发生骚乱当地华人发声", "方媛穿宽松连衣裙陪郭富城看赛马", "俄境内再遭乌无人机“最深入”袭击", "女子长时间久坐刷手机致眼中风", "日本火箭发射5秒后爆炸", "第一批高考结束的同学出现了", "燃气公司回应招北大毕业生当抄表工", "无腿鞋匠修鞋4年还清30多万负债", "美国发现13具尸体疑连环杀手作案", "加州起诉特朗普政府调兵进入洛杉矶", "陈昊宇独居时半夜曾遇入室抢劫", "《潜渊》首播收视率", "苹果发布iOS 26", "两大因素引爆美国加州“内战”升级", "马斯克“星链”卫星为何接连坠落", "印度汽车业敦促政府联系中国", "樊振东闫安打乒乓球玩起转圈圈", "洛杉矶惊现新兵种", "媒体：苏超赢了 江苏赢大了", "闫安回应输给樊振东很开心", "黄圣依：结婚不要放弃自己的权利", "樊振东称关键球上可能运气好点", "水电工为逗孩子开心自制机械爬虫", "约700名士兵将部署至洛杉矶地区", "热门中概股多数收涨", "孩子误闯马路父亲飞身救娃", "中美经贸磋商机制首次会议开始举行", "“青云直上”具象化了", "今年第1号台风要来了", "乒超联赛6月10日赛程出炉"]

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
