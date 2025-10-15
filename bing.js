// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.354
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
var default_search_words = ["“中国和冰岛都积极倡导性别平等”", "日本队被中国逆转后集体“凝固”", "让二追三！国乒男团3-2日本晋级决赛", "不张扬 自闪耀 她们自成星辰", "考公年龄放宽至38岁 考生发声", "浙大拟用2360万租房当学生宿舍", "女主播每天播12小时替榜一还钱", "在泰国威胁中国游客的导游已被捕", "官方介入调查为人民服务地标被破坏", "台青在吴石将军夫妇合葬墓前哽咽", "最高检即将对5省开展巡视", "大雁塔玄奘铜像长满青苔系AI生成", "两地出1000万大奖 中奖者为同一人", "高校菜鸟驿站对取件未出库罚款100", "牛弹琴：美国干的事越来越离谱了", "跑腿骑手取走万元手机后失联", "演员李威出庭不认罪", "“世界超市”6.0版来了", "禁毒大队长被控走私毒品获刑三年半", "官方回应“四五十只羊围吃绿化带”", "日本“幽灵舰队”毒害太平洋环礁", "厦门4名摊贩被判刑：猪肉当牛肉卖", "武汉一国企花6382万买沥青变成水", "马达加斯加军方宣布接管国家政权", "参加总理座谈会的这8个人是谁", "副部级王波被查前一个月还在捞钱", "中国降雨带是否发生北移？专家解读", "于东来称胖东来账上有41亿", "国考今天开始报名", "游客赴泰旅游遭导游威胁 中使馆提醒", "女孩获救后求助“救救奶奶和弟弟”", "青海藏马熊群垃圾场觅食：挖到啥吃啥", "男子变现2公斤金条净赚100万", "王楚钦2比3松岛辉空", "山姆枣泥核桃蛋糕被曝吃出“牙齿”", "印尼政府坚定奉行不与以接触政策", "中部“黑马”为什么又是这里", "中国游客在泰国被威胁购物 使馆发声", "特朗普：我对“两国方案”还没有表态", "高市早苗誓言“绝对要当上首相”", "江西6人开奔驰在餐馆消费370元逃单", "金价这么高 到底谁在买", "养老院为何会成为年轻人的向往之地", "直-20T的T代表什么意思", "特朗普向遭枪杀盟友追授总统自由勋章", "英国军队陷入“肥胖危机”", "经济日报：公平航道不容霸权阻拦", "美政府将移民执法与拨款挂钩是违法", "“盲人室友总帮我从食堂带饭”", "古驰蔻依罗意威被罚款1.57亿欧元", "林诗栋3比2逆转篠塚大登"]

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
