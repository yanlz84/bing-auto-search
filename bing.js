// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.154
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
var default_search_words = ["习近平向美国匹克球访华团回复口信", "特朗普回应马斯克成立美国党：荒谬", "王毅这句话的含金量还在飙升", "热浪来袭 如何做好防护", "郭晶晶问为何叫山东舰 权威解答来了", "官方回应苏超南京队长不文明动作", "七七事变88周年", "地震频发 日本第二批岛民撤离避难", "男子奶茶被盗打110 民警14分钟追回", "鹿晗安慰粉丝别哭", "宣布成立\"美国党\"后 马斯克再发声", "吃野生菌一家7人被毒死？谣言", "马斯克：未来12个月的焦点是国会两院", "澳洲男生庆祝与女友同居 后空翻身亡", "滞留印度的英军F-35B被拖入机库", "孙颖莎3-2刘杨子", "当地回应游客包车在阿坝坠崖落水", "央视曝光零差评背后猫腻", "60岁张曼玉巴黎被偶遇", "今日小暑", "台风“丹娜丝”强势登陆台湾", "舅舅回应16个外甥连续5年来过暑假", "美国得州洪灾 特朗普签重大灾难声明", "小米路由器被指“偷偷减配”", "孙颖莎赛后感谢邱贻可", "张帅组合晋级温网混双八强", "小米YU7首批交付 雷军为车主开车门", "金世佳方回应身份证掉了", "女子称丽江一店冰淇淋9.9元变48元", "中国女篮63-76澳大利亚女篮", "王楚钦：一直是孙颖莎带着我打", "普京追授阵亡俄海军副总司令奖章", "#马斯克的美国党能撬动两党吗#", "福岛事故14年后 日本重新开始用核能", "中企承建关键路段通车 武契奇表态", "美国犹他州一商场发生爆炸", "湖人击败热火迎夏联首胜", "曝美军加快B-21轰炸机生产速度", "美国得州洪灾死亡人数升至51人", "马斯克回应对特朗普“由爱转恨”", "新疆博尔塔拉州精河县发生4.3级地震", "保住笔画！常州0比0淮安取苏超首分", "郭晶晶夫妇参观山东舰 体验枪械操作", "3对母女包车游坠河 2死5失联", "国外团队成功模拟特定容错量子计算", "零食店店员给顾客下跪道歉？多方回应", "苏里南选出首位女总统", "一批“大国重器”传来好消息", "特斯拉美股夜盘大跌超7%", "张雨绮推荐重庆蘸水小吃", "常州进球无效"]

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
